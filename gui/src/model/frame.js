export class Frame {
    //TODO: create class Frame and let Act, Fact and ClaimDuty inherit from it
    constructor() {

    }
    getSubClass(frameType) {

    }
}

export const frameTypes =
{
    "act": {
        'class': 'relation',
        'label': 'Act'
    },
    "claim_duty": {
        'class': 'relation',
        'label': 'Claim-duty'
    },
    "fact": {
        'class': 'fact',
        'label': 'Fact',
        'subTypes': {
            "agent": {
                'class': 'fact',
                'label': 'Agent'
            },
            "action": {
                'class': 'fact',
                'label': 'Action'
            },
            "object": {
                'class': 'fact',
                'label': 'Object'
            },
            "duty": {
                'class': 'fact',
                'label': 'Duty'
            },
            "condition": {
                'class': 'fact',
                'label': 'Condition'
            }
        }
    }
}