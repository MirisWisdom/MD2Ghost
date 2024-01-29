/**
 * Copyright (C) 2024 Emilian Roman / Miris Wisdom
 *
 * This file is part of MD2Ghost.
 *
 * MD2Ghost is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * MD2Ghost is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with MD2Ghost.  If not, see <http://www.gnu.org/licenses/>.
 */

// Import necessary modules for file system operations, path handling, command execution, environment variables, and Ghost API.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');
const GhostAdminAPI = require('@tryghost/admin-api');

/**
 * Load environment variables from the .env file. This ensures that sensitive information such as the Ghost API URL and key are not hard-coded in the script.
 */
dotenv.config();

/**
 * Configure the Ghost API client using the loaded environment variables. The GhostAdminAPI instance is created with the URL, key, and API version information.
 */
const api = new GhostAdminAPI({
    url: process.env.GHOST_API_URL,
    key: process.env.GHOST_ADMIN_API_KEY,
    version: 'v3.0'
});

/**
 * Define a function to convert Markdown to HTML using Pandoc. The function takes a path to a Markdown file as an argument and returns the corresponding HTML.
 *
 * @param {*} markdownPath
 * @returns
 */
function convertMarkdownToHtml(markdownPath) {
    try {
        // Execute the Pandoc command to convert Markdown to HTML.
        // The resulting HTML is obtained by synchronously executing the command with the provided markdownPath.
        const html = execSync(`pandoc -f markdown -t html "${markdownPath}"`, { encoding: 'utf-8' });
        return html.trim();
    } catch (error) {
        // Handle errors that may occur during the Pandoc conversion and log an error message.
        console.error(`Error converting Markdown to HTML: ${error.message}`);
        return null;
    }
}

/**
 * Define an asynchronous function to publish a post using the Ghost API.
 * The function takes the post title, HTML content, associated tag, and post status as arguments.
 *
 * @param {*} title
 * @param {*} html
 * @param {*} tag
 * @param {*} status
 */
async function publishPost(title, html, tag, status) {
    try {
        // Use the Ghost API client to add a new post with the specified title, HTML content, tag, and status.
        // The response from the API is logged upon success.
        const response = await api.posts.add({
            title: title,
            html: html,
            tags: [{ name: tag }],
            status: status
        });
        console.log(`Post "${title}" published successfully.`, response);
    } catch (error) {
        // Handle errors that may occur during the post publication and log an error message.
        console.error(`Error publishing post "${title}":`, error);
    }
}

/**
 * Define an asynchronous function to traverse the data directory and publish posts from each sub-directory.
 * It reads Markdown files from sub-directories representing tags.
 */
async function publishPosts() {
    // Define the path to the data directory, and set the default status for posts to "draft" if not provided in the environment.
    const dataDir = path.join(__dirname, 'data');
    const status = process.env.POST_STATUS || 'draft';

    try {
        // Read the data directory and filter for sub-directories (representing tags).
        const tagDirs = fs.readdirSync(dataDir, { withFileTypes: true }).filter(dirent => dirent.isDirectory());

        // Traverse each tag directory.
        for (const tagDir of tagDirs) {
            const tag = tagDir.name;
            const tagPath = path.join(dataDir, tag);

            // Read Markdown files in the tag directory and filter for files with a '.md' extension.
            const markdownFiles = fs.readdirSync(tagPath).filter(file => file.endsWith('.md'));

            // Process each Markdown file within the tag directory.
            for (const markdownFile of markdownFiles) {
                const title = path.parse(markdownFile).name;
                const markdownPath = path.join(tagPath, markdownFile);
                const html = convertMarkdownToHtml(markdownPath);

                // If HTML conversion is successful, publish the post using the Ghost API.
                if (html) {
                    await publishPost(title, html, tag, status);
                }
            }
        }
    } catch (error) {
        // Handle errors that may occur during directory traversal and log an error message.
        console.error('Error reading data directory:', error);
    }
}

// Invoke the script to start the process of publishing posts.
publishPosts();