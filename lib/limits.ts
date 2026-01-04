export const PLANS = {
    FREE: 'free',
    PRO: 'pro',
    TEAM: 'team',
} as const;

export const LIMITS = {
    [PLANS.FREE]: {
        maxDashboards: 1,
        maxCards: 10,
        maxTeamMembers: 1, // Just themselves
        maxVisualizations: 1,
    },
    [PLANS.PRO]: {
        maxDashboards: 3,
        maxCards: Infinity, // Unlimited
        maxTeamMembers: 5,
        maxVisualizations: Infinity,
    },
    [PLANS.TEAM]: {
        maxDashboards: Infinity,
        maxCards: Infinity,
        maxTeamMembers: Infinity, // Or a higher limit like 100
        maxVisualizations: Infinity,
    },
};