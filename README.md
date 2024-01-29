# Markdown to Ghost CMS

## Introduction

This rather pragmatic script will publish your set of Markdown files to a [Ghost CMS](https://ghost.org/) instance. This project is especially useful when migrating/importing data into Ghost, or when drafting multiple Markdown files offline.

The script operates by traversing the `data` directory, with the expectation that:

1. Each sub-directory represents a tag for Ghost (e.g. `tech`, `health`); and
2. Markdown files within those sub-directories represent individual blog posts.

The file name of the Markdown file is used as the title, and the contents are used for the body. The contents will be converted to HTML using Pandoc.

```
data
└── test
    └── Hello World.md
    └── Another Test Post.md
└── health
    └── How to Blink.md
    └── How to Breathe.md
```

## Prerequisites

Before running the script, ensure you have the following:

- Node.js installed on your machine, as the script has been bittersweetly written in JavaScript.
- The required npm packages installed. Run the following command to install them:

  ```bash
  npm install @tryghost/admin-api dotenv
  ```

- Pandoc installed for Markdown to HTML conversion.

## Setup

1. Clone this repository to your local machine.
2. Copy the `.env.example` file to `.env` file in the root directory, and revise the values accordingly:

   ```env
   GHOST_API_URL=https://your-ghost-site.com
   GHOST_ADMIN_API_KEY=your-ghost-admin-api-key
   POST_STATUS=draft
   ```

   Replace `https://your-ghost-site.com` and `your-ghost-admin-api-key` with your Ghost CMS site URL and admin API key. Using `POST_STATUS`, you can specify whether the posts should be submitted as `draft` or be `published` immediately.

3. Populate the `data` directory with sub-directories representing tags, each containing Markdown files for blog posts.

## Usage

Simply run the script using the following command:

```bash
node md2ghost.js
```

## Configuration

Adjust the script's behavior by modifying the environment variables in the `.env` file:

| Variable              | Description                                                           |
| --------------------- | --------------------------------------------------------------------- |
| `GHOST_API_URL`       | The URL of your Ghost CMS site.                                       |
| `GHOST_ADMIN_API_KEY` | Your Ghost admin API key.                                             |
| `POST_STATUS`         | (Optional) Set the default status for posts ("published" or "draft"). |
