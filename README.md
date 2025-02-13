# ripple.ai - Natural Language to Mermaid Diagram Generator

ripple.ai is a modern web application that converts natural language descriptions into beautiful Mermaid diagrams. Using the power of AI, it allows users to describe their desired flowcharts, sequence diagrams, or state diagrams in plain English and instantly generates corresponding visual representations.

## Features

- 🎯 **Natural Language Processing**: Convert text descriptions into diagrams
- 📊 **Multiple Diagram Types**: Support for flowcharts, sequence diagrams, and state diagrams
- 🎨 **Real-time Preview**: Instant visualization of generated diagrams
- 💾 **Export Options**: Download diagrams as SVG or PNG
- 🎯 **Clean UI**: Minimalist and intuitive user interface
- 🚀 **Production-Ready**: Built with scalability and performance in mind

## Tech Stack

### Frontend

- Next.js 13+ (React)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Mermaid.js for diagram rendering

### Backend

- FastAPI
- Langchain
- OpenAI GPT-4
- Python 3.8+

## Getting Started

### Prerequisites

- Node.js 16.x or later
- Python 3.8 or later
- OpenAI API key

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/ripple.ai.git
cd ripple.ai
```

2. Backend Setup

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file and add your OpenAI API key
echo "OPENAI_API_KEY=your_api_key_here" > .env
```

3. Frontend Setup

```bash
# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" > .env.local
```

### Running the Application

1. Start the backend server

```bash
# From the root directory
cd backend
uvicorn main:app --reload
```

2. Start the frontend development server

```bash
# From the root directory
npm run dev
```

The application will be available at `http://localhost:3000`

## Usage

1. Select the type of diagram you want to create from the dropdown menu
2. Enter a description of your diagram in natural language
3. Click "Generate Diagram" to create your visualization
4. Download the diagram as SVG or PNG using the download buttons

### Example Input

```text
Create a workflow where a user logs in, checks their dashboard, can either view reports or create new entries, and finally logs out
```

## Environment Variables

### Backend

- `OPENAI_API_KEY`: Your OpenAI API key

### Frontend

- `NEXT_PUBLIC_BACKEND_URL`: URL of the backend API

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Diagram rendering powered by [Mermaid.js](https://mermaid-js.github.io/)
- AI capabilities provided by [OpenAI](https://openai.com/)
