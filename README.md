# 🇪🇬 Egypt Explorer
### 1st Place Winner — Capgemini Hackathon at AI Everything Egypt (Feb 2026)

Egypt Explorer is an AI-powered platform designed to combat online misinformation and bias about Egypt, giving tourists an honest, immersive, and locally-guided experience of the country.

---

## Problem Statement

Tourist dissatisfaction is increasingly driven by biased, prejudiced, and misleading content found online about Egypt. Negative stereotypes and misinformation distort perception before tourists even arrive, leading to poor experiences and missed opportunities for authentic cultural connection.

---

## Solution

A full roadmap platform that guides tourists through discovering the real Egypt — from debunking online bias before the trip, to navigating destinations during it, to connecting with locals throughout.

---

## Features

### 🔍 AI Bias Detection Tool
- Accepts a screenshot or pasted text from any online comment or review
- Powered by the Gemini API to detect emotional bias patterns such as stereotyping, overgeneralization, and cultural prejudice
- Generates a heatmap visualizing the percentage of bias detected per segment
- Provides a reframed, balanced perspective on the original comment

### 🤖 RAG-Based Itinerary Chatbot
- A Retrieval-Augmented Generation (RAG) LLM chatbot built to help tourists plan their trips
- Answers detailed questions about Egyptian destinations, customs, and logistics
- Grounded in curated, accurate data to minimize hallucination

### 🌍 Dual Portal — Tourists & Locals
- **Tourist portal:** Explore verified destinations, plan itineraries, and access community-contributed hidden gems
- **Local portal:** Locals can register their products and services for digital visibility, and contribute undiscovered destinations to the platform's database

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Figma Make |
| Backend | FastAPI |
| Database | MongoDB Atlas |
| AI / LLM | Gemini API, RAG pipeline |
| Prototyping | Google Colab |

---

## Team & Context

Built in under 5 days as part of the Capgemini Hackathon at AI Everything Egypt (February 2026), following an in-office design thinking workshop focused on deeply understanding the tourist user persona.

**Result:** 🥇 First place out of 6 competing teams.

---

## Project Structure

```
egypt-explorer/
├── backend/
│   ├── main.py               # FastAPI entry point
│   ├── bias_detection/       # Gemini API bias detection logic
│   ├── chatbot/              # RAG pipeline and LLM integration
│   └── database/             # MongoDB Atlas connection and models
├── frontend/
│   ├── src/
│   │   ├── tourist/          # Tourist portal pages and components
│   │   └── local/            # Local portal pages and components
└── README.md
```

---

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- MongoDB Atlas account
- Gemini API key

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```


## License

This project was built for hackathon purposes. All rights reserved.
