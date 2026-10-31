import logging
import certifi
import dns.resolver
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from app.config import MONGODB_URI, MONGODB_DATABASE

# Ensure robust DNS resolution for MongoDB Atlas SRV records
try:
    custom_resolver = dns.resolver.Resolver(configure=False)
    custom_resolver.nameservers = ['8.8.8.8', '1.1.1.1', '8.8.4.4']
    dns.resolver.default_resolver = custom_resolver
except Exception:
    pass

logger = logging.getLogger("dexmind.database")

_client = None

def get_client() -> MongoClient:
    global _client
    if _client is None:
        if not MONGODB_URI:
            raise ValueError(
                "MONGODB_URI is not set. Please set MONGODB_URI in your backend/.env file to connect to MongoDB Atlas."
            )
        try:
            _client = MongoClient(
                MONGODB_URI,
                tlsCAFile=certifi.where(),
                serverSelectionTimeoutMS=15000,
                connectTimeoutMS=15000,
                socketTimeoutMS=45000,
                appname="DexMind-RAG"
            )
            # Force server selection to verify connectivity
            _client.admin.command('ping')
            logger.info("Successfully connected to MongoDB Atlas.")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB Atlas: {e}")
            raise ConnectionError(
                f"Failed to connect to MongoDB Atlas: {str(e)}. "
                "Common cause: Your current IP address is not whitelisted in MongoDB Atlas Network Access."
            ) from e
    return _client

def get_db():
    client = get_client()
    return client[MONGODB_DATABASE]

def get_source_docs_col():
    return get_db()["source_documents"]

def get_pokemon_col():
    return get_db()["pokemon"]

def get_dex_chunks_col():
    return get_db()["dex_chunks"]

def check_connection():
    """Returns connectivity details and counts."""
    if not MONGODB_URI:
        return {
            "connected": False,
            "error": "MONGODB_URI environment variable is missing.",
            "database": MONGODB_DATABASE,
            "pokemon_count": 0,
            "source_docs_count": 0,
            "dex_chunks_count": 0
        }
    try:
        client = get_client()
        client.admin.command('ping')
        db = client[MONGODB_DATABASE]
        pokemon_count = db["pokemon"].count_documents({})
        source_docs_count = db["source_documents"].count_documents({})
        dex_chunks_count = db["dex_chunks"].count_documents({})
        return {
            "connected": True,
            "database": MONGODB_DATABASE,
            "pokemon_count": pokemon_count,
            "source_docs_count": source_docs_count,
            "dex_chunks_count": dex_chunks_count
        }
    except Exception as e:
        return {
            "connected": False,
            "error": str(e),
            "database": MONGODB_DATABASE,
            "pokemon_count": 0,
            "source_docs_count": 0,
            "dex_chunks_count": 0
        }
