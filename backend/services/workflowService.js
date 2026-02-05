/**
 * Workflow State Machine for Invoice Lifecycle
 */

const STATES = {
    RECEIVED: 'RECEIVED',
    DIGITIZING: 'DIGITIZING',
    VALIDATION_REQUIRED: 'VALIDATION_REQUIRED',
    MATCH_DISCREPANCY: 'MATCH_DISCREPANCY',
    VERIFIED: 'VERIFIED',
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    PAID: 'PAID'
};

const TRANSITIONS = {
    [STATES.RECEIVED]: [STATES.DIGITIZING],
    [STATES.DIGITIZING]: [STATES.VALIDATION_REQUIRED, STATES.MATCH_DISCREPANCY, STATES.VERIFIED],
    [STATES.VALIDATION_REQUIRED]: [STATES.DIGITIZING, STATES.REJECTED],
    [STATES.MATCH_DISCREPANCY]: [STATES.DIGITIZING, STATES.REJECTED, STATES.VERIFIED],
    [STATES.VERIFIED]: [STATES.PENDING_APPROVAL, STATES.REJECTED],
    [STATES.PENDING_APPROVAL]: [STATES.APPROVED, STATES.REJECTED],
    [STATES.APPROVED]: [STATES.PAID],
    [STATES.REJECTED]: [STATES.RECEIVED], // Allow re-submission/correction
    [STATES.PAID]: []
};

const getNextAllowedStates = (currentStatus) => {
    return TRANSITIONS[currentStatus] || [];
};

const validateTransition = (currentStatus, nextStatus) => {
    const allowed = getNextAllowedStates(currentStatus);
    return allowed.includes(nextStatus);
};

module.exports = {
    STATES,
    getNextAllowedStates,
    validateTransition
};
