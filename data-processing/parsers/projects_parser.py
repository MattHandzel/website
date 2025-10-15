import frontmatter
from pathlib import Path
from datetime import datetime


class ProjectsParser:
    def __init__(self, db_manager, excluded_folders=None, start_date=None, logger=None):
        self.db_manager = db_manager
        self.excluded_folders = excluded_folders or []
        self.start_date = start_date
        self.logger = logger
    
    def parse_projects(self, projects_dir):
        """Parse project folders and their markdown files"""
        projects_path = Path(projects_dir)
        
        if not projects_path.exists():
            print(f"Projects directory not found at {projects_path}")
            return
        
        # Iterate through subdirectories in the projects folder
        for project_folder in projects_path.iterdir():
            if not project_folder.is_dir():
                continue
            
            # Skip excluded folders
            if project_folder.name in self.excluded_folders:
                print(f"Skipping excluded project folder: {project_folder.name}")
                continue
            
            # Try to find the project markdown file in priority order:
            # 1. {folder-name}.md
            # 2. readme.md (case-insensitive)
            # 3. about.md (case-insensitive)
            
            project_file = None
            file_priority = [
                project_folder / f"{project_folder.name}.md",
                project_folder / "readme.md",
                project_folder / "README.md",
                project_folder / "about.md",
                project_folder / "ABOUT.md",
            ]
            
            for candidate_file in file_priority:
                if candidate_file.exists():
                    project_file = candidate_file
                    break
            
            if not project_file:
                print(f"No valid project file found in {project_folder.name}, skipping")
                continue
            
            try:
                with open(project_file, 'r', encoding='utf-8') as f:
                    post = frontmatter.load(f)
                
                # Check if the project is public
                public = post.metadata.get('public', False)
                if not public:
                    print(f"Skipping private project: {project_folder.name}")
                    continue
                
                # Skip based on date filter if applicable
                if self._should_skip_file(post.metadata, project_file.name):
                    continue
                
                # Extract project data
                project_data = {
                    'id': post.metadata.get('id', project_folder.name),
                    'title': post.metadata.get('title', project_folder.name.replace('-', ' ').title()),
                    'description': post.metadata.get('description', ''),
                    'tags': post.metadata.get('tags', []),
                    'content': post.content,
                    'public': public,
                    'created_date': post.metadata.get('created_date', datetime.now().isoformat()),
                    'last_edited_date': post.metadata.get('last_edited_date', datetime.now().isoformat()),
                    'status': post.metadata.get('status', 'active'),
                    'links': post.metadata.get('links', []),
                    'metadata': {
                        'file_path': str(project_file),
                        'folder_name': project_folder.name,
                        'file_name': project_file.name,
                        'aliases': post.metadata.get('aliases', []),
                    }
                }
                
                self.db_manager.insert_project(project_data)
                print(f"Processed project: {project_data['title']}")
                
            except Exception as e:
                print(f"Error processing project {project_folder.name}: {e}")
                if self.logger:
                    self.logger.error(f"Error processing project {project_folder.name}: {e}")
    
    def _should_skip_file(self, metadata, filename):
        """Check if file should be skipped based on date filter"""
        if not self.start_date:
            return False
        
        try:
            # Try to get date from metadata
            file_date_str = metadata.get('last_edited_date') or metadata.get('created_date')
            if file_date_str:
                # Handle ISO format dates
                file_date = datetime.fromisoformat(file_date_str.replace('Z', '+00:00'))
                return file_date < self.start_date
        except:
            pass
        
        return False
