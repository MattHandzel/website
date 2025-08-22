import frontmatter
import re
from pathlib import Path
from datetime import datetime

class FinancialParser:
    def __init__(self, db_manager):
        self.db_manager = db_manager
    
    def parse_financial_files(self, financial_dir):
        financial_path = Path(financial_dir)
        
        for md_file in financial_path.glob("*.md"):
            try:
                with open(md_file, 'r', encoding='utf-8') as f:
                    post = frontmatter.load(f)
                
                self.extract_budget_data(post.content, post.metadata)
                print(f"Processed financial file: {md_file.name}")
                
            except Exception as e:
                print(f"Error processing {md_file}: {e}")
    
    def extract_budget_data(self, content, metadata):
        lines = content.split('\n')
        current_section = None
        month = self.extract_month_from_content(content)
        
        for line in lines:
            line = line.strip()
            
            if line.startswith('## '):
                current_section = line.replace('## ', '').strip()
                continue
            
            if current_section and line.startswith('- ') and ':' in line:
                item_match = re.match(r'- (.+?): \$?([\d,]+)', line)
                if item_match:
                    item_name = item_match.group(1).strip()
                    amount_str = item_match.group(2).replace(',', '')
                    
                    try:
                        amount = float(amount_str)
                        
                        financial_data = {
                            'id': f"{month}_{current_section.lower().replace(' ', '_')}_{item_name.lower().replace(' ', '_')}",
                            'month': month,
                            'category': current_section,
                            'subcategory': item_name,
                            'amount': amount,
                            'type': self.categorize_financial_type(current_section),
                            'created_date': metadata.get('created_date', datetime.now().isoformat()),
                            'metadata': {
                                'source_file': metadata.get('id', 'unknown')
                            }
                        }
                        
                        self.db_manager.insert_financial_data(financial_data)
                        
                    except ValueError:
                        continue
    
    def extract_month_from_content(self, content):
        month_match = re.search(r'# Monthly Budget - (.+)', content)
        if month_match:
            return month_match.group(1).strip()
        return datetime.now().strftime("%B %Y")
    
    def categorize_financial_type(self, section):
        section_lower = section.lower()
        if 'income' in section_lower:
            return 'income'
        elif 'expense' in section_lower or 'fixed' in section_lower or 'variable' in section_lower:
            return 'expense'
        elif 'saving' in section_lower or 'investment' in section_lower:
            return 'savings'
        else:
            return 'other'
    
    def calculate_financial_summary(self, month):
        financial_data = self.db_manager.get_financial_data(month)
        
        summary = {
            'total_income': 0,
            'total_expenses': 0,
            'total_savings': 0,
            'net_worth_change': 0
        }
        
        for item in financial_data:
            if item['type'] == 'income':
                summary['total_income'] += item['amount']
            elif item['type'] == 'expense':
                summary['total_expenses'] += item['amount']
            elif item['type'] == 'savings':
                summary['total_savings'] += item['amount']
        
        summary['net_worth_change'] = summary['total_income'] - summary['total_expenses']
        
        return summary
