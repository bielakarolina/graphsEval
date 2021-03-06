module.exports = {

    loadDataSetFromNeo4j: async function (dataSetType) {
        const test = require("../../dataBase/test");
        if (dataSetType.includes("bbcfood"))
            if (dataSetType.includes("large")) return await test.loadBbcFoodData(false);
            else return await test.loadBbcFoodData();
        else if (dataSetType.includes("stackoverflow"))
            if (dataSetType.includes("large")) return await test.loadStackOverflowData(false);
            else return await test.loadStackOverflowData();
        else if (dataSetType.includes("movies"))
            if (dataSetType.includes("large")) return await test.loadMoviesData(false);
            else return await test.loadMoviesData();
    },

    loadAdditionalData: async function (dataSetType) {
        const test = require("../../dataBase/test");
        if (dataSetType.includes("large")) return await test.loadAdditionalData(false);
        else return await test.loadAdditionalData();

    },

    getNodesStructureForLibrary: async function (libraryType) {
        let nodeNameProperties = []
        if (libraryType === "vis")
            nodeNameProperties = ["label", "group", "properties"];
        else if (libraryType === "d3")
            nodeNameProperties = ["name", "type", "properties"];
        else if (libraryType === "cytoscape")
            nodeNameProperties = ["label", "type", "properties"];
        return nodeNameProperties
    },

    getEdgesStructureForLibrary: async function (libraryType) {
        let edgeNameProperties = []

        if (libraryType === "vis")
            edgeNameProperties = ["from", "to", "title"];
        else if (libraryType === "d3" || libraryType === "cytoscape")
            edgeNameProperties = ["source", "target", "label"];
        return edgeNameProperties
    },

    parseNeo4jDataComponent: async function (libraryType, dataSetType, additional= false) {
        if(additional) let data = await this.loadAdditionalData(dataSetType);
        else let data = await this.loadDataSetFromNeo4j(dataSetType);
        let keys = data.keys;
        console.log(keys)
        let nodes = [];
        let edges = [];
        let ids = {};
        let colors = ["red", "pink", "blue", "green", "white", "purple", "orange", "yellow"]
        let groups = {};
        console.log(libraryType);
        let nodeNameProperties = await this.getNodesStructureForLibrary(libraryType)
        let edgeProperties = await this.getEdgesStructureForLibrary(libraryType)

        data.data.forEach(function (fields) {
            let c = 0;
            fields.forEach(function (singleField, index) {
                if (!keys[index].includes("type")) {
                    if (libraryType === "cytoscape") {
                        let position = {"position": {"x": 1452.639173965406, "y": 609.3619416544145}};
                        data = {position};
                    }
                    let id = singleField["identity"];
                    let label = singleField["labels"];
                    let properties = singleField["properties"];
                    if (groups[label[0]] === undefined) {
                        groups[label[0]] = c;
                        c += 1;
                    }

                    if (id["low"] === 0 || isNaN(id["low"])) id["low"] = parseInt(`${properties["id"]}${c}`);

                    let node = {
                        id: parseInt(id["low"]),
                        [nodeNameProperties[0]]: properties["title"] || properties["name"] || properties["display_name"] || label[0], //zmiana
                        [nodeNameProperties[1]]: groups[label[0]],
                        [nodeNameProperties[2]]: properties,
                    };
                    if (libraryType === "cytoscape") node["group"] = "nodes";
                    let p = id["low"];
                    if (libraryType === "d3") {
                        node["color"] = colors[node["type"]]

                    }
                    if (ids[p] === undefined && libraryType !== "cytoscape") {
                        ids[p] = true;
                        nodes.push(node);
                    } else if (ids[p] === undefined && libraryType === "cytoscape") {
                        ids[p] = true;
                        data = {...node};
                        nodes.push({data: data});
                    }


                } else {
                    let relationshipTitle = singleField;
                    let from = fields[index - 1];
                    let fromIdentity = from["identity"];
                    let to = fields[index + 1];
                    let toIdentity = to["identity"];
                    if (toIdentity["low"] === 0 || isNaN(toIdentity["low"])) toIdentity["low"] = parseInt(`${Math.round(Math.random() * 10)}${c}`);
                    if (fromIdentity["low"] === 0 || isNaN(fromIdentity["low"])) fromIdentity["low"] = parseInt(`${Math.round(Math.random() * 10)}${c}`);

                    let edge = {
                        [edgeProperties[0]]: fromIdentity["low"],
                        [edgeProperties[1]]: toIdentity["low"],
                        [edgeProperties[2]]: relationshipTitle
                    };
                    if (libraryType === "cytoscape") {
                        edge["group"] = "edges";
                        edge["id"] = `${fromIdentity["low"]}${toIdentity["low"]}edge`;
                        data = {...edge};
                        nodes.push({data: data});
                    } else edges.push(edge);
                }
            })
        });

        if (libraryType === "cytoscape") return nodes;
        else if (libraryType === "d3") return {nodes: nodes, links: edges};
        else return {nodes: nodes, edges: edges};
    },
    parseNeo4jDataForVis: async function () {
        const test = require("../../dataBase/test");
        let data = await test.loadBbcFoodData();
        let keys = data.keys;
        let nodes = [];
        let edges = [];
        let ids = {};
        let groups = {};
        data.data.forEach(function (fields) {
            let c = 0;
            fields.forEach(function (singleField, index) {
                if (!keys[index].includes("type")) {
                    let id = singleField["identity"];
                    let label = singleField["labels"];
                    let properties = singleField["properties"];
                    if (groups[label[0]] === undefined) {
                        groups[label[0]] = c;
                        c += 1;
                    }
                    let node = {
                        id: id["low"],
                        label: properties["title"] || properties["name"] || properties["display_name"] || label[0],
                        group: groups[label[0]],
                        properties: properties,
                    };
                    let p = id["low"].toString();

                    if (ids[p] === undefined) {
                        ids[p] = true;
                        nodes.push(node);
                    }

                } else {
                    let relationshipTitle = singleField;
                    let from = fields[index - 1];
                    let fromIdentity = from["identity"];
                    let to = fields[index + 1];
                    let toIdentity = to["identity"];

                    // console.log(to);
                    let edge = {
                        from: fromIdentity["low"],
                        to: toIdentity["low"],
                        title: relationshipTitle
                    };
                    edges.push(edge);
                }
            })
        });
        // console.log(nodes, edges);
        return {nodes: nodes, edges: edges};
    },

    parseNeo4jDataForD3: async function () {
        const test = require("../../dataBase/test");
        let data = await test.loadBbcFoodData();
        let keys = data.keys;
        let nodes = [];
        let edges = [];
        let ids = {};
        let groups = {};
        data.data.forEach(function (fields) {
            let c = 0;
            fields.forEach(function (singleField, index) {
                if (!keys[index].includes("type")) {
                    let id = singleField["identity"];
                    let label = singleField["labels"];
                    let properties = singleField["properties"];
                    if (groups[label[0]] === undefined) {
                        groups[label[0]] = c;
                        c += 1;
                    }
                    let node = {
                        id: id["low"],
                        label: properties["title"] || properties["name"] || properties["display_name"] || label[0],
                        type: groups[label[0]],
                        properties: properties,
                    };
                    let p = id["low"].toString();

                    if (ids[p] === undefined) {
                        ids[p] = true;
                        nodes.push(node);
                    }

                } else {
                    let relationshipTitle = singleField;
                    let from = fields[index - 1];
                    let fromIdentity = from["identity"];
                    let to = fields[index + 1];
                    let toIdentity = to["identity"];

                    // console.log(to);
                    let edge = {
                        source: fromIdentity["low"],
                        target: toIdentity["low"],
                        title: relationshipTitle
                    };
                    edges.push(edge);
                }
            })
        });
        console.log(nodes, edges);
        return {nodes: nodes, links: edges};
    },
    parseNeo4jDataForCytoscape: async function () {
        const test = require("../../dataBase/test");
        let data = await test.loadBbcFoodData();
        let keys = data.keys;
        let nodes = [];
        let edges = [];
        let ids = {};
        let groups = {};
        data.data.forEach(function (fields) {
            let c = 0;
            fields.forEach(function (singleField, index) {
                let data = {};
                if (!keys[index].includes("type")) {
                    let position = {"position": {"x": 1452.639173965406, "y": 609.3619416544145}};
                    data = {position};

                    let id = singleField["identity"];
                    let label = singleField["labels"];
                    let properties = singleField["properties"];
                    if (groups[label[0]] === undefined) {
                        groups[label[0]] = c;
                        c += 1;
                    }
                    let node = {
                        id: id["low"],
                        text: properties["title"] || properties["name"] || properties["display_name"] || label[0],
                        type: groups[label[0]],
                        group: "nodes",
                    };
                    let p = id["low"].toString();

                    if (ids[p] === undefined) {
                        ids[p] = true;
                        data = {...node};
                        nodes.push({data: data});
                    }

                } else {
                    let relationshipTitle = singleField;
                    let from = fields[index - 1];
                    let fromIdentity = from["identity"];
                    let to = fields[index + 1];
                    let toIdentity = to["identity"];

                    // console.log(to);
                    let edge = {
                        id: fromIdentity["low"] + toIdentity["low"],
                        source: fromIdentity["low"],
                        target: toIdentity["low"],
                        text: relationshipTitle,
                        group: "edges"
                    };
                    data = {...edge};
                    nodes.push({data: data});
                }
            })
        });
        console.log(nodes)
        return nodes;
    }
};