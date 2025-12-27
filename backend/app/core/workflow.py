"""
Status workflow state machine for maintenance requests.
"""
from typing import Tuple

# Allowed status transitions
# Format: current_status -> list of allowed next statuses
STATUS_TRANSITIONS = {
    "new": ["in_progress"],
    "in_progress": ["repaired", "new"],  # Can go back to new if needed
    "repaired": ["scrap"],  # Only admin can do this
    "scrap": [],  # Terminal state - no transitions allowed
}

# All valid statuses
VALID_STATUSES = list(STATUS_TRANSITIONS.keys())


def validate_status_transition(current_status: str, new_status: str) -> Tuple[bool, str]:
    """
    Validate if a status transition is allowed.
    
    Args:
        current_status: Current status of the request
        new_status: Desired new status
    
    Returns:
        Tuple of (is_valid, error_message)
        - is_valid: True if transition is allowed
        - error_message: Empty if valid, otherwise explanation
    """
    # Same status is always allowed (no-op)
    if current_status == new_status:
        return True, ""
    
    # Check if current status exists
    if current_status not in STATUS_TRANSITIONS:
        return False, f"Invalid current status: {current_status}"
    
    # Check if new status is valid
    if new_status not in VALID_STATUSES:
        return False, f"Invalid status: {new_status}. Must be one of: {VALID_STATUSES}"
    
    # Check if transition is allowed
    allowed_next = STATUS_TRANSITIONS.get(current_status, [])
    if new_status not in allowed_next:
        return False, f"Cannot transition from '{current_status}' to '{new_status}'. Allowed: {allowed_next or 'none (terminal state)'}"
    
    return True, ""


def get_allowed_transitions(current_status: str) -> list:
    """
    Get list of allowed next statuses from current status.
    
    Args:
        current_status: Current status of the request
    
    Returns:
        List of allowed next statuses
    """
    return STATUS_TRANSITIONS.get(current_status, [])


def is_terminal_status(status: str) -> bool:
    """Check if a status is terminal (no further transitions allowed)."""
    return len(STATUS_TRANSITIONS.get(status, [])) == 0
