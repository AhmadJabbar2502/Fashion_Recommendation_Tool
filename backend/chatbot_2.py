import os
from groq import Groq
from langchain_pinecone import PineconeVectorStore
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.prompts import PromptTemplate
from langchain.schema.runnable import RunnablePassthrough
from langchain.schema.output_parser import StrOutputParser
from pinecone import Pinecone, ServerlessSpec
from templates import retriever_template, response_template, general_template

client = Groq(
    api_key="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" # Ensure the GROQ_API_KEY environment variable is set
)

class Chatbot:
    def __init__(self):
        self.ids = []  # Store Mongo IDs here
        self.retriever = None
        self.vector_store = None
        self.initialize_vector_store()
        self.initialize_retriever()

    def initialize_vector_store(self):
        # Initialize Pinecone connection
        pc = Pinecone("pcsk_iAgUU_FXUSfemuBAKgQTBG1eKLxZyoxA9RfUMgdpQJNkF8H1dYSaQtRbRAauDzviDsQ8w")

        index_name = "llms-project"

        # Check if index exists, else create it
        if index_name not in pc.list_indexes().names():
            pc.create_index(
                name=index_name,
                dimension=768,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="aws",
                    region="us-east-1"
                )
            )

        embeddings = HuggingFaceEmbeddings()  # Use default embedding model
        index = pc.Index(index_name)
        self.vector_store = PineconeVectorStore(index=index, embedding=embeddings)

    def extract_by_keyword(self, input_text):
        keyword = "Description:"
        extracted_items = [
            line.split(f"{keyword} ")[1].strip()
            for line in input_text.splitlines()
            if keyword in line and f"{keyword} " in line
        ]
        
        # Use retriever to get relevant documents based on extracted items
        retriever = self.vector_store.as_retriever(
            search_type="similarity_score_threshold",
            search_kwargs={"k": 2, "score_threshold": 0.6}
        )
        
        for item in extracted_items:
            results = retriever.get_relevant_documents(item)  # Get relevant documents
            for doc in results:
                if 'mongo_id' in doc.metadata: 
                    self.ids.append(doc.metadata['mongo_id'])  # Collect Mongo IDs
        
        return list(set(self.ids))  # Remove duplicates from the list

    def initialize_retriever(self):
        self.retriever = self.vector_store.as_retriever(
        search_type="similarity_score_threshold",
        search_kwargs={"k": 3, "score_threshold": 0.6},
        )

    def generate_with_groq(self, question):
        # Call GroqCloud API using the Groq client
        prompt = retriever_template.format(question=question)
        
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama3-8b-8192",
        )

        return chat_completion.choices[0].message.content

    def response_chain(self, question: str) -> str:
        # Generate response using Groq's Llama3 model
        response = self.generate_with_groq(question)
        return response

# Initialize chatbot instance
chatbot = Chatbot()

# Example question
question = "What should I wear with black chino?"
response = chatbot.response_chain(question)
print(response)

# If you need to extract descriptions:
# input_text = """
# Description: A pair of navy blue trousers designed for men, perfect for a semi-formal or business casual setting. The navy blue ….
# """
# ids = chatbot.extract_by_keyword(input_text)
# print(ids)
