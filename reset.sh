#!/bin/bash


echo "🔄 Starting complete data reset..."

echo "📁 Removing existing database..."
rm -f database/website.db

echo "📁 Removing existing JSON data files..."
rm -f website/data/*.json

echo "📁 Clearing Next.js build cache..."
rm -rf website/.next

cd data-processing

echo "⚙️  Running data processing pipeline..."
python main.py --start-date 2025-07-14

echo "📤 Exporting static data..."
python export_static_data.py

echo "✅ Reset complete! All data has been cleared and reprocessed."
echo "💡 You can now run 'cd website && npm run dev' to start the development server."
