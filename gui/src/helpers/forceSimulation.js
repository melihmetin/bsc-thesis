import {
    forceX,
    forceY,
    forceManyBody,
    forceLink,
    forceSimulation,
    forceCollide,
} from "d3-force";

import { EventEmitter } from 'events';
export const positionsUpdated = new EventEmitter(); //emits event when new node positions have been calculated

let simulation

let nodesInSimulation = []
let linksInSimulation = []

export function initSimulation() {
    console.log("initializing network");
    //resize();
    //gravitate towards center
    const fX = forceX(0).strength(0.05);
    const fY = forceY(0).strength(0.05);
    simulation = forceSimulation(nodesInSimulation)
        .force("x", fX)
        .force("y", fY)
        .force("charge", forceManyBody().strength(-1200))
        .force("link", forceLink(linksInSimulation)) //.id((d) => d.id))
        .force(
            "collide",
            forceCollide()
                .radius((n) => 20)
                .iterations(3)
        )
        .on("tick", () => ticked()) //anonymous, otherwise 'this' refers to simulation
        .alphaDecay(0.0228)
        .on("end", () => {
            positionsUpdated.emit('change',
                { nodePositions: nodesInSimulation, linkPositions: linksInSimulation }
            )
        })
}

function ticked() {
    if (simulation.alpha() < 0.5) {
        //release nodes that have fixed position
        nodesInSimulation.forEach(n => {
            n.fx = null
            n.fy = null
        })
    }
    positionsUpdated.emit('change',
        { nodePositions: nodesInSimulation, linkPositions: linksInSimulation }
    )
}

//network contains attributes nodes and links
//nodes: list of objects with property 'id'
//edges: list of objects with properties 'source' and 'target', both having
//values that are id's of nodess
export function restartSimulation(nodes, links) {
    nodesInSimulation = [...nodes]
    linksInSimulation = [...links]
    if (simulation) {
        simulation.stop();
        simulation.nodes(nodesInSimulation);
        simulation
            .force("link")
            .links(linksInSimulation)
        simulation.alpha(1).restart();
    }
}

export function stopSimulation() {
    simulation.stop()
}

