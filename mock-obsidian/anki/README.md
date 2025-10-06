# Anki Data Export Instructions

To add your Anki learning data to the website, follow these steps:

## Method 1: Text File Export (Recommended for beginners)

1. Open Anki
2. Select the deck you want to export
3. Go to File → Export
4. Choose "Notes in Plain Text"
5. Make sure "Include HTML and media references" is checked
6. Save the file as `[deck-name].txt` in this directory

## Method 2: Database Export (Advanced - more data)

1. Close Anki completely
2. Find your Anki data folder:
   - Windows: `%APPDATA%\Anki2\[profile-name]\collection.anki2`
   - Mac: `~/Library/Application Support/Anki2/[profile-name]/collection.anki2`
   - Linux: `~/.local/share/Anki2/[profile-name]/collection.anki2`
3. Copy the `collection.anki2` file to this directory and rename it to `anki-collection.db`

## What Data is Extracted

- **Text exports**: Card content and deck information
- **Database exports**: Complete review history, intervals, ease factors, time spent per card, success rates

## After Adding Files

1. Run the processing pipeline: `cd data-processing && python main.py`
2. Export static data: `python export_static_data.py`
3. Build the website: `cd ../website && npm run build`

Your Anki learning statistics will appear in the "Anki Learning" tab on the website.
