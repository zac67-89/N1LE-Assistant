const express = require("express");
const { Client } = require("@notionhq/client");
require("dotenv").config();

const app = express();
app.use(express.json());

const notion = new Client({
  auth: process.env.NOTION_SECRET
});

const PORT = process.env.PORT || 3000;

const DATABASES = {
  note: process.env.NOTES_DB,
  task: process.env.TASKS_DB,
  idea: process.env.IDEAS_DB,
};

app.post("/capture", async (req, res) => {
  const { type, title, content } = req.body;

  if (!DATABASES[type]) {
    return res.status(400).json({ error: "Invalid type" });
  }

  try {
    let properties = {};

    switch (type) {
      case "note":
        properties = {
          Title: {
            title: [{ text: { content: title } }]
          },
          Content: {
            rich_text: [{ text: { content } }]
          }
        };
        break;

      case "task":
        properties = {
          Task: {
            title: [{ text: { content: title } }]
          },
          Status: {
            select: { name: "To Do" }
          }
        };
        break;

      case "idea":
        properties = {
          Title: {
            title: [{ text: { content: title } }]
          },
          Description: {
            rich_text: [{ text: { content } }]
          }
        };
        break;
    }

    await notion.pages.create({
      parent: {
        database_id: DATABASES[type]
      },
      properties
    });

    res.json({
      success: true,
      saved_to: type
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log("Running on port 3000");
});