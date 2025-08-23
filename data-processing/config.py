import yaml
from pathlib import Path
import os

class Config:
    def __init__(self, config_path=None):
        if config_path is None:
            parent_dir = Path(__file__).parent.parent
            config_path = parent_dir / "config.yaml"
            if not config_path.exists():
                config_path = parent_dir / "config-dev.yaml"
        
        self.config_path = Path(config_path)
        self.data = self._load_config()
        
    def _load_config(self):
        if not self.config_path.exists():
            raise FileNotFoundError(f"Config file not found at {self.config_path}")
            
        with open(self.config_path, 'r') as f:
            return yaml.safe_load(f)
    
    def get_vault_base_path(self):
        base_path = self.data['vault']['base_path']
        return Path(os.path.expanduser(base_path))
    
    def get_directory_path(self, directory_key):
        base_path = self.get_vault_base_path()
        relative_path = self.data['vault']['directories'][directory_key]
        return base_path / relative_path
    
    def get_database_path(self):
        base_dir = Path(__file__).parent.parent
        return base_dir / self.data['database']['path']
