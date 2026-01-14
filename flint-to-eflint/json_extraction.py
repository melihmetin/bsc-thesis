import json
from dataclasses import dataclass

# Dataclasses for each frame in FLINT json
@dataclass
class Act:
    id: str
    typeId: str
    label: str
    actionId: str
    actorId: str
    recipientId: str
    objectId: str
    precondition: dict
    creates: list[str]
    terminates: list[str]

@dataclass
class Fact:
    id: str
    typeId: str
    subTypeIds: list[str]
    label: str

@dataclass
class ClaimDuty:
    id: str
    typeId: str
    label: str
    dutyId: str
    holderId: str
    claimantId: str

# This function is used in eflint_generator to get json frames and use the extracted frames into the template
def extract_json(data: dict) -> list:
    frames = data['frames']

    # 1) Build a lookup dict. {fact_id: fact_label}
    fact_label_by_id = {}
    for p in frames:
        fact_label_by_id[p['id']] = p['label']

    extracted_frames = []
    
    # 2) Helper function to use the lookup dict
    def find_fact_label(frame_id: str) -> str:
        return fact_label_by_id[frame_id]

    # 3) Create instances of the classes to use in the eflint_generator
    for p in frames:
        typ = p['typeId']

        if typ == 'act':
            x = Act(
                id=p['id'],
                typeId=typ,
                label=p['label'],
                actionId=p['actionId'],
                actorId=find_fact_label(p['actorId']),
                recipientId=find_fact_label(p['recipientId']),
                objectId=find_fact_label(p['objectId']),
                precondition=p['precondition'],
                creates=[find_fact_label(q) for q in p['creates']],
                terminates=[find_fact_label(q) for q in p['terminates']]
            )

        elif typ == 'fact':
            raw_subtypes = p.get('subTypeIds') or p.get('subTypeId')

            if not isinstance(raw_subtypes, list):
                raw_subtypes = [raw_subtypes]

            x = Fact(
                id=p['id'],
                typeId=typ,
                subTypeIds=raw_subtypes,
                label=p['label']
            )

        elif typ == 'claim_duty':
            x = ClaimDuty(
                id=p['id'],
                typeId=typ,
                label=p['label'],
                dutyId=p['dutyId'],
                holderId=find_fact_label(p['holderId']),
                claimantId=find_fact_label(p['claimantId'])
            )

        extracted_frames.append(x)

    return extracted_frames