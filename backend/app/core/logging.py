import logging
import sys

def setup_logging():
    log_format = "%(asctime)s - [%(levelname)s] - %(name)s - %(message)s"
    handler = logging.StreamHandler(sys.stdout)
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass
    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        handlers=[handler]
    )
    return logging.getLogger("nexus-intelligence")

logger = setup_logging()
