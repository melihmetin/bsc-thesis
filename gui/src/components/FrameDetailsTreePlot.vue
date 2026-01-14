<template>
    <div class="bg-white q-pa-md all-pointer-events">
        <div class="row items-top">
            <div class="col text-h6">{{ frame.shortName }}</div>
            <div>
                <q-btn class="cursor-pointer" icon="mdi-close" size="sm" flat round dense @click="close"/>
            </div>
        </div>
        <template v-if="frame.typeId == 'act'">
            <div class="main-label">Precondition</div>
            <template v-if="!frame.precondition.isEmpty">
                <FactOrBooleanConstructPlot
                    :factOrBooleanConstruct="frame.precondition"
                />
            </template>
            <template v-else>
                <div>-</div>
            </template>
            <div class="main-label">Roles</div>
            <div v-for="roleName in ['action', 'actor', 'object', 'recipient']">
                <div class="text-capitalize">{{roleName}}</div>
                <template v-if="frame[roleName]">
                    <FactOrBooleanConstructPlot
                        :factOrBooleanConstruct="frame[roleName]"
                    />
                </template>
                <template>
                    <div>-</div>
                </template>
            </div>
            <div class="main-label">Postcondition</div>
            <div class="">Creates</div>
            <template v-if="frame.creates.length > 0">
                <div v-for="createdFrame in frame.creates">
                    <template v-if="createdFrame.typeId == 'claim_duty'">
                        <div class="row">
                            <div class="claimDutyDot" />
                            <div class="text-xs">{{createdFrame.shortName}}</div>
                        </div>
                    </template>
                    <template v-else>
                        <FactOrBooleanConstructPlot
                            :factOrBooleanConstruct="createdFrame"
                        />
                    </template>
                </div>
            </template>
            <template v-else>
                <div>-</div>
            </template>
            
            <div class="">Terminates</div>
            <template v-if="frame.terminates.length > 0">
                <div v-for="terminatedFrame in frame.terminates">
                    <template v-if="terminatedFrame.typeId == 'claim_duty'">
                        <div class="row">
                            <div class="claim-duty-dot" />
                            <div class="text-xs">{{terminatedFrame.shortName}}</div>
                        </div>
                    </template>
                    <template v-else>
                        <FactOrBooleanConstructPlot
                            :factOrBooleanConstruct="terminatedFrame"
                        />
                    </template>
                </div>
            </template>
            <template v-else>
                <div>-</div>
            </template>
        </template>
        <template v-if="frame.typeId == 'claim_duty'">
            <div class="main-label">Roles</div>
            <div v-for="roleName in ['duty', 'claimant', 'holder']">
                <div class="text-capitalize">{{roleName}}</div>
                <template v-if="frame[roleName]">
                    <FactOrBooleanConstructPlot
                        :factOrBooleanConstruct="frame[roleName]"
                    />
                </template>
                <template>
                    <div>-</div>
                </template>
            </div>
        </template>
    </div>
</template>

<script>
import FactOrBooleanConstructPlot from "./FactOrBooleanConstructPlot.vue";
export default {
    data: () => ({

    }),
    props: {
        frame: Object
    },
    components: {
        FactOrBooleanConstructPlot
    },
    computed: {
    },
    methods: {
        close() {
            this.$store.state.selectedNode = null
        }
    }
}
</script>


<style>
    .main-label {
        background-color: #b6d1ec;
        /* color: #ffffff; */
        padding: 2px 6px;
        font-size: 10pt;
        font-weight: bold;
        margin-top:4px;
    }
    .claim-duty-dot {
        width: 12px;
        height: 12px;
        border-radius: 6px;
        background-color: #c51162;
    }
</style>
