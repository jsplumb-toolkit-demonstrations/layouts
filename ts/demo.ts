import  { ready, newInstance, EVENT_TAP, EVENT_CLICK } from "@jsplumbtoolkit/browser-ui"
import {randomHierarchy, randomNode} from "@jsplumb/toolkit-demo-support"
import {EndpointSpec, BlankEndpoint, DotEndpoint, TRUE, FALSE } from "@jsplumb/core"
import {StateMachineConnector} from "@jsplumb/connector-bezier"
import {HierarchicalLayout} from "@jsplumbtoolkit/layout-hierarchical"
import { UndoRedoUpdateParams, EVENT_UNDOREDO_UPDATE, ObjectInfo, Node } from "@jsplumbtoolkit/core"
import {MiniviewPlugin} from "@jsplumbtoolkit/plugin-miniview"
import {SpringLayout} from "@jsplumbtoolkit/layout-spring"
import {CircularLayout} from "@jsplumbtoolkit/layout-circular"
import { newInstance as newSyntaxHighlighter} from "@jsplumb/json-syntax-highlighter"


ready(function () {

    const toolkit = newInstance({
        beforeStartDetach:() => { return false }
    })

    const controls = document.querySelector(".controls")

    const view = {
        nodes: {
            "default": {
                templateId: "tmplNode"
            }
        },
        edges: {
            "default": {
                connector: { type:StateMachineConnector.type, options:{ curviness: 10 } },
                paintStyle: { strokeWidth: 2, stroke: '#89bcde' },
                endpoints: [ { type:DotEndpoint.type, options:{ radius: 4 } }, BlankEndpoint.type ] as [EndpointSpec, EndpointSpec]
            }
        }
    }

    const mainElement = document.querySelector("#jtk-demo-layouts"),
        canvasElement = mainElement.querySelector(".jtk-demo-canvas"),
        miniviewElement = mainElement.querySelector(".miniview"),
        layoutSelector = document.querySelector("#layout")

    // make a random hierarchy and store how many nodes there are; we will use this when we add new nodes.
    const hierarchy = randomHierarchy(3)

    toolkit.load({type: "json", data: hierarchy})

    const renderer = toolkit.render(canvasElement, {
        zoomToFit: true,
        view: view,
        layout: {
            type: HierarchicalLayout.type
        },
        events: {
            canvasClick: function (e) {
                toolkit.clearSelection();
            }
        },
        defaults: {
            anchor: "Center",
            endpointStyle: { fill: "gray" },
            endpointHoverStyle: { fill: "#FF6600" }
        },
        refreshLayoutOnEdgeConnect:true,
        elementsDraggable:false,
        plugins:[
            {
                type:MiniviewPlugin.type,
                options:{
                    container:miniviewElement
                }
            }
        ],
        storePositionsInModel:false            // by default this is true, and useful. We set it to false in this demonstration to ensure that each layout
                                               // is operating without any previous placement values (the Absolute layout, for instance would just use
                                               // values from the model which had been generated by a previous layout, so you'd see no difference).
    })

    renderer.on(controls, EVENT_TAP, "[undo]", () => {
        toolkit.undo()
    })

    renderer.on(controls, EVENT_TAP, "[redo]", () => {
        toolkit.redo()
    })

    toolkit.bind(EVENT_UNDOREDO_UPDATE, (state:UndoRedoUpdateParams) => {
        controls.setAttribute("can-undo", state.undoCount > 0 ? TRUE : FALSE)
        controls.setAttribute("can-redo", state.redoCount > 0 ? TRUE : FALSE)
    })

    //
    // use event delegation to attach event handlers to
    // remove buttons. This callback finds the related Node and
    // then tells the toolkit to delete it.
    //
    renderer.bindModelEvent<Node>(EVENT_TAP, ".delete", (event:Event, target:HTMLElement, info:ObjectInfo<Node>) => {
        const selection = toolkit.selectDescendants(info.obj, true)
        toolkit.transaction(function() {
            toolkit.remove(selection)
        })
    })

    //
    // use event delegation to attach event handlers to
    // add buttons. This callback adds an edge from the given node
    // to a newly created node, and then the layout is refreshed.
    //
    renderer.bindModelEvent<Node>(EVENT_TAP, ".add", (event:Event, target:HTMLElement, info:ObjectInfo<Node>) => {
        // get a random node.
        const n = randomNode("node")

        // start a transaction so that the new node and the edge to the existing node are wrapped into a single
        // unit of work, and can be undone/redone together.
        toolkit.transaction(() => {
            // add the node to the toolkit
            const newNode = toolkit.addNode(n);
            // and add an edge for it from the current node.
            toolkit.addEdge({source: info.obj, target: newNode})
        })
    })

    // on home button tap, zoom content to fit.
    renderer.on(mainElement, EVENT_TAP, "[reset]", () => {
        renderer.zoomToFit()
    })

    // create a syntax highlighter, to dump the current dataset to the screen
    newSyntaxHighlighter(toolkit, ".jtk-demo-dataset");

    const layoutParams = {
        [SpringLayout.type]:{
            absoluteBacked:false,
            padding:{x:250,y:50}
        },
        [HierarchicalLayout.type]:{
            orientation: "horizontal",
            padding: {x:100, y:60}
        },
        "HierarchicalCompressed":{
            orientation: "horizontal",
            padding: {x:30,y:30},
            spacing:"compress"
        },
        "HierarchicalAlignStart":{
            orientation: "horizontal",
            padding: {x:100, y:60},
            align:"start"
        },
        "HierarchicalAlignEnd":{
            orientation: "horizontal",
            padding: {x:100, y:60},
            align:"end"
        },

        "HierarchicalVertical":{
            orientation: "vertical",
            padding: {x:160, y:60}
        },

        "HierarchicalVerticalAlignStart":{
            orientation: "vertical",
            padding: {x:160, y:60},
            align:"start"
        },
        "HierarchicalVerticalAlignEnd":{
            orientation: "vertical",
            padding: {x:160, y:60},
            align:"end"
        },

        "HierarchicalInverted":{
            orientation: "horizontal",
            padding: {x:160, y:60},
            invert:true
        },
        "HierarchicalInvertedAlignStart":{
            orientation: "horizontal",
            padding: {x:160, y:60},
            invert:true,
            align:"start"
        },
        "HierarchicalInvertedAlignEnd":{
            orientation: "horizontal",
            padding: {x:160, y:60},
            invert:true,
            align:"end"
        },

        "HierarchicalVerticalInverted":{
            orientation: "vertical",
            padding: {x:160, y:60},
            invert:true
        },
        "HierarchicalVerticalInvertedAlignStart":{
            orientation: "vertical",
            padding: {x:160, y:60},
            invert:true,
            align:"start"
        },
        "HierarchicalVerticalInvertedAlignEnd":{
            orientation: "vertical",
            padding: {x:160, y:60},
            invert:true,
            align:"end"
        },
        [CircularLayout.type]:{
            padding:{x:15, y:15}
        },
        "CircularCenteredRoot":{
            padding:{x:15, y:15},
            centerRootNode:true
        }
    };

    // change layout when user picks one from the drop down.
    renderer.on(layoutSelector, "change", (e:Event) => {
        const sel = (e.target as HTMLSelectElement),
            opt = sel.options[sel.selectedIndex],
            id = opt.value,
            extra = opt.getAttribute("extra") || "",
            paramKey = id + extra,
            params = layoutParams[paramKey] || {},
            lp = {
                type:id,
                options:params
            }

        renderer.setLayout(lp)
        renderer.zoomToFit()

        // JSON cast to any here because the .d.ts has overloaded versions of `stringify`
        document.querySelector(".config pre").innerHTML = (JSON as any).stringify(lp, 2, 2)
    })

    renderer.on(document.querySelector("#btnRegenerate"), EVENT_CLICK, () => {
        toolkit.clear()
        toolkit.load({
            data:randomHierarchy(3)
        })
    })

    renderer.on(document.querySelector("#btnRelayout"), EVENT_CLICK, () => {
        renderer.relayout()
    })
})
