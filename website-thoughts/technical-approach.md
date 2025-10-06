---
id: technical-approach
aliases:
  - Technical Approach
  - technical-approach
tags: []
created_date: "2025-08-19"
last_edited_date: "2025-08-22"
---

# Technical Approach

This is an outline technically how I will do this website.

- Oracle free-tier machine for hosting, if this is not beefy enough I can have my personal machine host this or buy cloud compute
- Supabase for storing my personal vault data as well as user data
- Buy website domain name on namecheap. Also, perhaps, buy email domain on there as well.

### Synchronizing Personal Website With My Data

I have many data sources, each data source has it's own method of synchronization. For every method, do that synchronization. If that data source is public, then copy its data to a database on supabase, oracle, etc.

#### Data Mining

For each 'different type' of data, (dailies, relationships, etc.) create a separate function that takes in the directory the data is stored, does processing on it, normalizes it, and stores it in a database.

Depending on the folder, specify data mining techniques, prompts, etc.

### Website

The website will be made up of many different components, the components are defined either as separate files, or in [[components]]. Each component should be atomic and it will source data from my obsidian vault.

I want all of the copy to be a function of markdown documents. For example, the "About This Site" section should be populated by a preprocessing stage, where the pre-processor looks into my obsidian vault, finds a markdown file called about-this-site.md, parses the contents of that file, puts it into a database, and then the website reads from that database.

### Architecture

So the architecture of this application is that there's going to be an obsidian vault on my like laptop, computer, whatever. And then, whenever I want to update the data on or for my website, I will run. Program. This is probably a python script, and it will. The python script will have many different functions that will look at my obsidian Vault and like, find files and do processing of.

It'll do processing of the data that I have. And then it will take all that information and then put that into a database. For development that databases will be local in the future of the database will be online. And then. When a user? Right. When a user opens my website, it will use the information from.

Though, like the website, when it's being rendered. It'll use information from my database. That is online.

So that? My webs. My personal website can be updated in somewhat real time. Whenever I run this data processing script.

My obsidian Vault is.

Tilda slash obsidian/ main/. And this is obsidian Vault and. And then the python script. I'll make specific functions that point to specific files, and then does parsing on them.
