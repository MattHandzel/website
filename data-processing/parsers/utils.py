#!/usr/bin/env python3

import re


def strip_html_comments(content):
    """
    Remove HTML comments from markdown content.
    
    HTML comments in markdown look like:
    - <!-- comment -->
    - <!---->
    
    Args:
        content: String containing markdown content with potential HTML comments
        
    Returns:
        String with all HTML comments removed
    """
    if not content:
        return content
    
    # Remove HTML comments using regex
    # Pattern matches: <!-- anything (including newlines) -->
    cleaned = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)
    
    return cleaned
