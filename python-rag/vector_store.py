"""
Vector Store Management using ChromaDB
Person Y Guide: This handles document storage and semantic search for RAG
Person X: Think of this as a smart filing cabinet that can find similar documents
"""

import os
import uuid
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
import logging

# Person Y: Set up logging for debugging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VectorStoreManager:
    """
    Person Y: Manages ChromaDB vector database for document storage and retrieval
    This enables semantic search across budget documents
    """
    
    def __init__(self, db_path: str = "./chroma_db", collection_name: str = "budget_documents"):
        self.db_path = db_path
        self.collection_name = collection_name
        self.embeddings = None
        self.vectorstore = None
        self.client = None
        self.collection = None
        
        # Person Y: Initialize the vector database
        self._initialize_db()
    
    def _initialize_db(self):
        """Initialize ChromaDB and embeddings"""
        try:
            # Person Y: Create directory if it doesn't exist
            os.makedirs(self.db_path, exist_ok=True)
            
            # Person Y: Initialize ChromaDB client
            self.client = chromadb.PersistentClient(
                path=self.db_path,
                settings=Settings(
                    anonymized_telemetry=False,
                    allow_reset=True
                )
            )
            
            # Person Y: Initialize embeddings model (lightweight but effective)
            self.embeddings = SentenceTransformerEmbeddings(
                model_name="all-MiniLM-L6-v2"
            )
            
            # Person Y: Get or create collection
            try:
                self.collection = self.client.get_collection(self.collection_name)
                logger.info(f"✅ Connected to existing ChromaDB collection: {self.collection_name}")
            except:
                self.collection = self.client.create_collection(
                    name=self.collection_name,
                    metadata={"description": "Budget documents and policies"}
                )
                logger.info(f"✅ Created new ChromaDB collection: {self.collection_name}")
            
            # Person Y: Initialize LangChain Chroma wrapper
            self.vectorstore = Chroma(
                client=self.client,
                collection_name=self.collection_name,
                embedding_function=self.embeddings
            )
            
            logger.info("✅ Vector store initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Error initializing vector store: {e}")
            raise
    
    def add_document(self, text: str, metadata: Dict[str, Any], user_id: str) -> str:
        """
        Person Y: Add a document to the vector store with chunking
        Returns the document ID for future reference
        """
        try:
            # Person Y: Split text into chunks for better retrieval
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len,
                separators=["\n\n", "\n", ". ", ".", " "]
            )
            
            chunks = text_splitter.split_text(text)
            
            # Person Y: Generate unique document ID
            doc_id = str(uuid.uuid4())
            
            # Person Y: Prepare documents with metadata
            documents = []
            metadatas = []
            ids = []
            
            for i, chunk in enumerate(chunks):
                chunk_id = f"{doc_id}_chunk_{i}"
                chunk_metadata = {
                    **metadata,
                    "user_id": user_id,
                    "document_id": doc_id,
                    "chunk_index": i,
                    "total_chunks": len(chunks)
                }
                
                documents.append(chunk)
                metadatas.append(chunk_metadata)
                ids.append(chunk_id)
            
            # Person Y: Add to vector store
            self.vectorstore.add_texts(
                texts=documents,
                metadatas=metadatas,
                ids=ids
            )
            
            logger.info(f"✅ Added document {doc_id} with {len(chunks)} chunks to vector store")
            return doc_id
            
        except Exception as e:
            logger.error(f"❌ Error adding document to vector store: {e}")
            raise
    
    def search_similar_documents(self, query: str, user_id: str, k: int = 5) -> List[Dict[str, Any]]:
        """
        Person Y: Search for similar documents using semantic similarity
        Filters results by user_id for data isolation
        """
        try:
            # Person Y: Perform similarity search with user filtering
            results = self.vectorstore.similarity_search_with_score(
                query=query,
                k=k,
                filter={"user_id": user_id}  # Person Y: Ensure user data isolation
            )
            
            # Person Y: Format results
            formatted_results = []
            for doc, score in results:
                formatted_results.append({
                    "content": doc.page_content,
                    "metadata": doc.metadata,
                    "similarity_score": float(score)
                })
            
            logger.info(f"✅ Found {len(formatted_results)} similar documents for query: {query[:50]}...")
            return formatted_results
            
        except Exception as e:
            logger.error(f"❌ Error searching documents: {e}")
            return []
    
    def search_budget_context(self, department: str, category: str, user_id: str) -> List[Dict[str, Any]]:
        """
        Person Y: Search for budget-related context for specific department/category
        This helps with generating better recommendations
        """
        try:
            # Person Y: Create specific query for budget context
            query = f"budget {department} {category} limit spending allocation"
            
            results = self.vectorstore.similarity_search_with_score(
                query=query,
                k=3,
                filter={
                    "user_id": user_id,
                    "document_type": "budget_policy"
                }
            )
            
            formatted_results = []
            for doc, score in results:
                formatted_results.append({
                    "content": doc.page_content,
                    "metadata": doc.metadata,
                    "relevance_score": float(score)
                })
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"❌ Error searching budget context: {e}")
            return []
    
    def get_user_documents(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all documents for a specific user"""
        try:
            # Person Y: Query all documents for user
            results = self.collection.get(
                where={"user_id": user_id}
            )
            
            documents = []
            for i in range(len(results['ids'])):
                documents.append({
                    "id": results['ids'][i],
                    "content": results['documents'][i],
                    "metadata": results['metadatas'][i]
                })
            
            return documents
            
        except Exception as e:
            logger.error(f"❌ Error getting user documents: {e}")
            return []
    
    def delete_document(self, document_id: str, user_id: str) -> bool:
        """Delete a document and all its chunks"""
        try:
            # Person Y: Find all chunks for this document
            results = self.collection.get(
                where={
                    "document_id": document_id,
                    "user_id": user_id
                }
            )
            
            if results['ids']:
                # Person Y: Delete all chunks
                self.collection.delete(ids=results['ids'])
                logger.info(f"✅ Deleted document {document_id} with {len(results['ids'])} chunks")
                return True
            else:
                logger.warning(f"⚠️ Document {document_id} not found for user {user_id}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error deleting document: {e}")
            return False
    
    def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about the vector database"""
        try:
            count = self.collection.count()
            
            return {
                "total_documents": count,
                "collection_name": self.collection_name,
                "embedding_model": "all-MiniLM-L6-v2",
                "status": "healthy"
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting collection stats: {e}")
            return {"status": "error", "error": str(e)}
    
    def reset_collection(self) -> bool:
        """
        Person Y: Reset the entire collection (use with caution!)
        Only for development/testing purposes
        """
        try:
            self.client.reset()
            self._initialize_db()
            logger.info("✅ Vector store collection reset successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error resetting collection: {e}")
            return False

# Person Y: Global instance for use across the application
vector_store_manager = VectorStoreManager()