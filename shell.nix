{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    # Node.js and package managers
    nodejs_20
    nodePackages.npm
    nodePackages.pnpm
    yarn
    
    # Python for data processing
    python312
    python312Packages.pip
    python312Packages.virtualenv
    
    # Development tools
    git
    jq
    curl
    
    # Database tools
    sqlite
  ];
  
  shellHook = ''
    echo "🌿 Catppuccin development environment loaded!"
    echo "Node.js: $(node --version)"
    echo "Python: $(python --version)"
    echo ""
    echo "Available commands:"
    echo "  cd website && npm run dev    # Start Next.js development server"
    echo "  cd data-processing && python main.py  # Process markdown files"
    echo ""
  '';
}
