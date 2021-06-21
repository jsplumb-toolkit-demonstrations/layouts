;
(function () {

    jsPlumbToolkitBrowserUI.ready(function () {

        var toolkit = jsPlumbToolkitBrowserUI.newInstance({
            beforeStartDetach:function() { return false; }
        });

        var controls = document.querySelector(".controls");

        var view = {
            nodes: {
                "default": {
                    templateId: "tmplNode"
                }
            },
            edges: {
                "default": {
                    connector: { type:"StateMachine", options:{ curviness: 10 } },
                    paintStyle: { strokeWidth: 2, stroke: '#89bcde' },
                    endpoints: [ { type:"Dot", options:{ radius: 4 } }, "Blank" ]
                }
            }
        };

        var mainElement = document.querySelector("#jtk-demo-layouts"),
            canvasElement = mainElement.querySelector(".jtk-demo-canvas"),
            miniviewElement = mainElement.querySelector(".miniview"),
            layoutSelector = document.querySelector("#layout");

        var randomHierarchy = function() {
            return jsPlumbToolkitDemoSupport.randomHierarchy(3);
        };

        // make a random hierarchy and store how many nodes there are; we will use this when we add new nodes.
        var hierarchy = randomHierarchy();

        var renderer = toolkit.load({type: "json", data: hierarchy}).render(canvasElement, {
            zoomToFit: true,
            view: view,
            layout: {
                type: "Hierarchical"
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
                    type:"miniview",
                    options:{
                        container:miniviewElement
                    }
                }
            ],
            storePositionsInModel:false            // by default this is true, and useful. We set it to false in this demonstration to ensure that each layout
                                                   // is operating without any previous placement values (the Absolute layout, for instance would just use
                                                   // values from the model which had been generated by a previous layout, so you'd see no difference).
        });

        renderer.on(controls, "tap", "[undo]", function () {
            toolkit.undo();
        });

        renderer.on(controls, "tap", "[redo]", function () {
            toolkit.redo();
        });

        toolkit.bind("undoredo:update", function(state) {
            controls.setAttribute("can-undo", state.undoCount > 0);
            controls.setAttribute("can-redo", state.redoCount > 0);
        });

        //
        // use event delegation to attach event handlers to
        // remove buttons. This callback finds the related Node and
        // then tells the toolkit to delete it.
        //
        renderer.bindModelEvent("tap", ".delete", function (event, target, info) {
            var selection = toolkit.selectDescendants(info.obj, true);
            toolkit.transaction(function() {
                toolkit.remove(selection);
            });
        });

        //
        // use event delegation to attach event handlers to
        // add buttons. This callback adds an edge from the given node
        // to a newly created node, and then the layout is refreshed.
        //
        renderer.bindModelEvent("tap", ".add", function (event, target, info) {
            // get a random node.
            var n = jsPlumbToolkitDemoSupport.randomNode();

            toolkit.transaction(function() {
                // add the node to the toolkit
                var newNode = toolkit.addNode(n);
                // and add an edge for it from the current node.
                toolkit.addEdge({source: info.obj, target: newNode});
            });

        });

        // on home button tap, zoom content to fit.
        renderer.on(mainElement, "tap", "[reset]", function () {
            renderer.zoomToFit();
        });

        jsPlumbToolkitSyntaxHighlighter.newInstance(toolkit, ".jtk-demo-dataset");

        var layoutParams = {
            "Spring":{
                absoluteBacked:false,
                padding:{x:250,y:50}
            },
            "Hierarchical":{
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

            "Circular":{
                padding:{x:15, y:15}
            },
            "CircularCenteredRoot":{
                padding:{x:15, y:15},
                centerRootNode:true
            }
        };

        // change layout when user picks one from the drop down.
        renderer.on(layoutSelector, "change", function() {
            var opt = this.options[this.selectedIndex],
                id = opt.value,
                extra = opt.getAttribute("extra") || "",
                paramKey = id + extra,
                params = layoutParams[paramKey] || {},
                lp = {
                    type:id,
                    options:params
                };

            renderer.setLayout(lp);
            renderer.zoomToFit();

            document.querySelector(".config pre").innerHTML = JSON.stringify(lp, 2, 2);
        });

        renderer.on(document.querySelector("#btnRegenerate"), "click", function() {
            toolkit.clear();
            toolkit.load({
                data:randomHierarchy()
            });
        });

        renderer.on(document.querySelector("#btnRelayout"), "click", function() {
            renderer.relayout();
        });
    });
})();
