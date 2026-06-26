const express = require("express");
const { Client } = require("@notionhq/client");
require("dotenv").config();
const { parseSmartInput } = require("./parser");
const app = express();
app.use(express.json());

const notion = new Client({
  auth: process.env.NOTION_SECRET,
});

const PORT = process.env.PORT || 3000;

const DATABASES = {
  note: process.env.NOTES_DB,
  task: process.env.TASKS_DB,
  idea: process.env.IDEAS_DB,
};



function buildNotionProperties(type, data) {
  if (type === "note") {
    return {
      Title: {
        title: [{ text: { content: data.title } }],
      },
      Content: {
        rich_text: [{ text: { content: data.content || "" } }],
      },
    };
  }

  if (type === "task") {
    const properties = {
      Task: {
        title: [{ text: { content: data.title } }],
      },
      Status: {
        select: { name: "To Do" },
      },
      Priority: {
        select: { name: data.priority || "Normal" },
      },
    };

    if (data.dueDate) {
      properties.Due = {
        date: {
          start: data.dueTime
            ? `${data.dueDate}T${data.dueTime}:00`
            : data.dueDate,
        },
      };
    }

    return properties;
  }

  if (type === "idea") {
    return {
      Title: {
        title: [{ text: { content: data.title } }],
      },
      Description: {
        rich_text: [{ text: { content: data.content || "" } }],
      },
    };
  }

  throw new Error("Invalid type");
}

async function saveToNotion(type, data) {
  if (!DATABASES[type]) {
    throw new Error(`Missing or invalid database for type: ${type}`);
  }

  const properties = buildNotionProperties(type, data);

  const page = await notion.pages.create({
    parent: {
      database_id: DATABASES[type],
    },
    properties,
  });

  return page;
}

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "N1LE Assistant server is running",
  });
});

app.post("/capture", async (req, res) => {
  try {
    const { type, title, content } = req.body;

    if (!type || !title) {
      return res.status(400).json({
        success: false,
        error: "type and title are required",
      });
    }

    await saveToNotion(type, {
      title,
      content,
    });

    res.json({
      success: true,
      saved_to: type,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post("/smart-capture", async (req, res) => {
  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({
        success: false,
        error: "input is required",
      });
    }

    const parsed = parseSmartInput(input);

    await saveToNotion(parsed.type, parsed);

    res.json({
      success: true,
      saved_to: parsed.type,
      parsed,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});