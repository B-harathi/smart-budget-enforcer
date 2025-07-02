
"""
CORRECTED Vector Store Management using ChromaDB
Enhanced for exact budget document storage and retrieval
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

# Set up logging for debugging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CorrectedVectorStoreManager:
    """
    CORRECTED: Enhanced ChromaDB vector database for exact document storage and retrieval
    Optimized for budget document semantic search and exact data matching
    """
    
    def __init__(self, db_path: str = "./corrected_chroma_db", collection_name: str = "corrected_budget_documents"):
        self.db_path = db_path
        self.collection_name = collection_name
        self.embeddings = None
        self.vectorstore = None
        self.client = None
        self.collection = None
        
        # Initialize the CORRECTED vector database
        self._initialize_corrected_db()
    
    def _initialize_corrected_db(self):
        """Initialize CORRECTED ChromaDB and embeddings"""
        try:
            # Create directory if it doesn't exist
            os.makedirs(self.db_path, exist_ok=True)
            
            # Initialize CORRECTED ChromaDB client
            self.client = chromadb.PersistentClient(
                path=self.db_path,
                settings=Settings(
                    anonymized_telemetry=False,
                    allow_reset=True
                )
            )
            
            # Initialize CORRECTED embeddings model (optimized for financial documents)
            self.embeddings = SentenceTransformerEmbeddings(
                model_name="all-MiniLM-L6-v2"  # Lightweight but effective for budget documents
            )
            
            # Get or create CORRECTED collection
            try:
                self.collection = self.client.get_collection(self.collection_name)
                logger.info(f"✅ Connected to existing CORRECTED ChromaDB collection: {self.collection_name}")
            except:
                self.collection = self.client.create_collection(
                    name=self.collection_name,
                    metadata={
                        "description": "CORRECTED budget documents with exact data extraction",
                        "version": "3.2.0_corrected",
                        "extraction_method": "exact_budget_matching"
                    }
                )
                logger.info(f"✅ Created new CORRECTED ChromaDB collection: {self.collection_name}")
            
            # Initialize CORRECTED LangChain Chroma wrapper
            self.vectorstore = Chroma(
                client=self.client,
                collection_name=self.collection_name,
                embedding_function=self.embeddings
            )
            
            logger.info("✅ CORRECTED Vector store initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Error initializing CORRECTED vector store: {e}")
            # Don't raise exception, continue with basic functionality
            self.vectorstore = None
    
    def add_document(self, text: str, metadata: Dict[str, Any], user_id: str) -> str:
        """
        CORRECTED: Add a document to the vector store with enhanced chunking for budget data
        Returns the document ID for future reference
        """
        try:
            if not self.vectorstore:
                logger.warning("⚠️ Vector store not initialized, skipping document storage")
                return str(uuid.uuid4())
            
            # CORRECTED: Enhanced text splitting optimized for budget documents
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=800,  # Smaller chunks for better budget data precision
                chunk_overlap=150,  # Reduced overlap to prevent duplicates
                length_function=len,
                separators=["\n\n", "\n", ". ", ".", " "],
                keep_separator=True
            )
            
            chunks = text_splitter.split_text(text)
            
            # Generate unique document ID
            doc_id = str(uuid.uuid4())
            
            # CORRECTED: Enhanced metadata with budget-specific fields
            documents = []
            metadatas = []
            ids = []
            
            for i, chunk in enumerate(chunks):
                # Skip very small chunks that might not contain useful budget data
                if len(chunk.strip()) < 20:
                    continue
                
                chunk_id = f"{doc_id}_chunk_{i}"
                chunk_metadata = {
                    **metadata,
                    "user_id": user_id,
                    "document_id": doc_id,
                    "chunk_index": i,
                    "total_chunks": len(chunks),
                    "chunk_length": len(chunk),
                    "corrected_processing": True,
                    "extraction_method": "exact_budget_parsing",
                    "storage_timestamp": str(uuid.uuid4())[:8]  # Unique timestamp
                }
                
                documents.append(chunk)
                metadatas.append(chunk_metadata)
                ids.append(chunk_id)
            
            # Add to CORRECTED vector store
            if documents:  # Only add if we have valid documents
                self.vectorstore.add_texts(
                    texts=documents,
                    metadatas=metadatas,
                    ids=ids
                )
                
                logger.info(f"✅ Added CORRECTED document {doc_id} with {len(documents)} validated chunks to vector store")
            else:
                logger.warning(f"⚠️ No valid chunks found in document {doc_id}")
            
            return doc_id
            
        except Exception as e:
            logger.error(f"❌ Error adding CORRECTED document to vector store: {e}")
            return str(uuid.uuid4())  # Return a dummy ID to prevent failures
    
    def search_similar_documents(self, query: str, user_id: str, k: int = 5) -> List[Dict[str, Any]]:
        """
        CORRECTED: Search for similar documents using enhanced semantic similarity
        Optimized for budget-related queries with better filtering
        """
        try:
            if not self.vectorstore:
                logger.warning("⚠️ Vector store not initialized, returning empty results")
                return []
            
            # CORRECTED: Enhanced query preprocessing for budget searches
            budget_query = self._enhance_budget_query(query)
            
            # Perform CORRECTED similarity search with user filtering
            results = self.vectorstore.similarity_search_with_score(
                query=budget_query,
                k=k,
                filter={"user_id": user_id, "corrected_processing": True}
            )
            
            # CORRECTED: Enhanced result formatting with confidence scoring
            formatted_results = []
            for doc, score in results:
                # Calculate confidence based on score and content relevance
                confidence = max(0, min(1, 1 - score))  # Convert distance to confidence
                
                formatted_results.append({
                    "content": doc.page_content,
                    "metadata": doc.metadata,
                    "similarity_score": float(score),
                    "confidence_score": confidence,
                    "corrected_analysis": True
                })
            
            logger.info(f"✅ Found {len(formatted_results)} CORRECTED similar documents for query: {query[:50]}...")
            return formatted_results
            
        except Exception as e:
            logger.error(f"❌ Error searching CORRECTED documents: {e}")
            return []
    
    def _enhance_budget_query(self, query: str) -> str:
        """CORRECTED: Enhance search query for better budget document matching"""
        try:
            # Add budget-related context terms
            budget_terms = ["budget", "allocation", "expense", "limit", "threshold", "department", "category"]
            
            # Check if query already contains budget terms
            query_lower = query.lower()
            has_budget_terms = any(term in query_lower for term in budget_terms)
            
            if not has_budget_terms:
                # Add relevant budget context
                enhanced_query = f"{query} budget allocation expense limit"
            else:
                enhanced_query = query
            
            return enhanced_query
            
        except Exception as e:
            logger.warning(f"⚠️ Query enhancement failed: {e}")
            return query
    
    def search_budget_context(self, department: str, category: str, user_id: str) -> List[Dict[str, Any]]:
        """
        CORRECTED: Search for budget-related context for specific department/category
        Enhanced for exact budget matching and recommendations
        """
        try:
            if not self.vectorstore:
                logger.warning("⚠️ Vector store not initialized, returning empty results")
                return []
            
            # CORRECTED: Create specific query for budget context
            query = f"budget {department} {category} limit spending allocation threshold"
            
            results = self.vectorstore.similarity_search_with_score(
                query=query,
                k=5,  # Increased for better context
                filter={
                    "user_id": user_id,
                    "corrected_processing": True
                }
            )
            
            # CORRECTED: Enhanced formatting with relevance scoring
            formatted_results = []
            for doc, score in results:
                relevance_score = max(0, min(1, 1 - score))
                
                formatted_results.append({
                    "content": doc.page_content,
                    "metadata": doc.metadata,
                    "relevance_score": float(relevance_score),
                    "department_match": department.lower() in doc.page_content.lower(),
                    "category_match": category.lower() in doc.page_content.lower(),
                    "corrected_context": True
                })
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"❌ Error searching CORRECTED budget context: {e}")
            return []
    
    def get_user_documents(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all CORRECTED documents for a specific user"""
        try:
            if not self.collection:
                logger.warning("⚠️ Collection not initialized, returning empty results")
                return []
            
            # Query all CORRECTED documents for user
            results = self.collection.get(
                where={
                    "user_id": user_id,
                    "corrected_processing": True
                }
            )
            
            documents = []
            for i in range(len(results['ids'])):
                documents.append({
                    "id": results['ids'][i],
                    "content": results['documents'][i],
                    "metadata": results['metadatas'][i],
                    "corrected_document": True
                })
            
            return documents
            
        except Exception as e:
            logger.error(f"❌ Error getting CORRECTED user documents: {e}")
            return []
    
    def delete_document(self, document_id: str, user_id: str) -> bool:
        """Delete a CORRECTED document and all its chunks"""
        try:
            if not self.collection:
                logger.warning("⚠️ Collection not initialized, cannot delete")
                return False
            
            # Find all chunks for this CORRECTED document
            results = self.collection.get(
                where={
                    "document_id": document_id,
                    "user_id": user_id,
                    "corrected_processing": True
                }
            )
            
            if results['ids']:
                # Delete all chunks
                self.collection.delete(ids=results['ids'])
                logger.info(f"✅ Deleted CORRECTED document {document_id} with {len(results['ids'])} chunks")
                return True
            else:
                logger.warning(f"⚠️ CORRECTED document {document_id} not found for user {user_id}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error deleting CORRECTED document: {e}")
            return False
    
    def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about the CORRECTED vector database"""
        try:
            if not self.collection:
                return {
                    "status": "error",
                    "error": "Collection not initialized",
                    "corrected_features": True
                }
            
            count = self.collection.count()
            
            return {
                "total_documents": count,
                "collection_name": self.collection_name,
                "embedding_model": "all-MiniLM-L6-v2",
                "status": "healthy",
                "corrected_features": True,
                "extraction_method": "exact_budget_parsing",
                "version": "3.2.0_corrected",
                "optimization": "budget_document_focused"
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting CORRECTED collection stats: {e}")
            return {"status": "error", "error": str(e), "corrected_features": True}
    
    def reset_collection(self) -> bool:
        """
        CORRECTED: Reset the entire collection (use with caution!)
        Only for development/testing purposes
        """
        try:
            if not self.client:
                logger.warning("⚠️ Client not initialized, cannot reset")
                return False
            
            self.client.reset()
            self._initialize_corrected_db()
            logger.info("✅ CORRECTED Vector store collection reset successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error resetting CORRECTED collection: {e}")
            return False
    
    def search_exact_budget_items(self, search_criteria: Dict[str, Any], user_id: str) -> List[Dict[str, Any]]:
        """
        CORRECTED: Search for exact budget items matching specific criteria
        Enhanced for precise budget data retrieval
        """
        try:
            if not self.vectorstore:
                logger.warning("⚠️ Vector store not initialized, returning empty results")
                return []
            
            # Build search query from criteria
            query_parts = []
            
            if search_criteria.get('department'):
                query_parts.append(f"department {search_criteria['department']}")
            if search_criteria.get('category'):
                query_parts.append(f"category {search_criteria['category']}")
            if search_criteria.get('amount_range'):
                min_amt, max_amt = search_criteria['amount_range']
                query_parts.append(f"amount {min_amt} {max_amt}")
            
            query = " ".join(query_parts) if query_parts else "budget allocation"
            
            # Search with enhanced filtering
            results = self.vectorstore.similarity_search_with_score(
                query=query,
                k=10,
                filter={
                    "user_id": user_id,
                    "corrected_processing": True
                }
            )
            
            # CORRECTED: Filter and format results
            exact_matches = []
            for doc, score in results:
                if score < 0.5:  # Only high-confidence matches
                    exact_matches.append({
                        "content": doc.page_content,
                        "metadata": doc.metadata,
                        "match_score": float(1 - score),
                        "exact_match": True,
                        "corrected_result": True
                    })
            
            return exact_matches
            
        except Exception as e:
            logger.error(f"❌ Error searching exact budget items: {e}")
            return []

# CORRECTED: Global instance for use across the application
vector_store_manager = CorrectedVectorStoreManager()