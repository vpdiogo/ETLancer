from app.connectors.base import BaseConnector

CONNECTOR_REGISTRY: dict[str, type[BaseConnector]] = {}


def register_connector(connector_type: str):
    """Decorator that registers a connector class in the global registry."""

    def decorator(cls: type[BaseConnector]):
        CONNECTOR_REGISTRY[connector_type] = cls
        return cls

    return decorator


def get_connector(
    connector_type: str, config: dict, credentials: dict | None = None
) -> BaseConnector:
    """Instantiate a connector by type string."""
    if connector_type not in CONNECTOR_REGISTRY:
        raise ValueError(
            f"Unknown connector type: {connector_type}. "
            f"Available: {list(CONNECTOR_REGISTRY.keys())}"
        )
    cls = CONNECTOR_REGISTRY[connector_type]
    return cls(config, credentials)
