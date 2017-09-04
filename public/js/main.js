function MainChart() {
    var main_div = $("#main");
    var mainChart = {
        width: main_div.width(),
        height: main_div.height(),
        tmp_nodes: [],
        nodes: [],
        links: [],
        rScale: d3.scale.linear().range([2, 8]),
        bScale: d3.scale.linear().range([1, 4]),
        rMax: 0,
        bMax: 0
    };

    d3.csv("/public/files/node-link-2.csv", function (error, data) {
        data.forEach(function (item) {
            mainChart.tmp_nodes.push(item.source);
            mainChart.tmp_nodes.push(item.target);
        });
        mainChart.tmp_nodes = d3.set(mainChart.tmp_nodes).values();
        mainChart.index_of_nodes = d3.map();

        for (var i = 0; i !== mainChart.tmp_nodes.length; ++i) {
            var degree = 0;
            data.forEach(function (t) {
                if (t.source === mainChart.tmp_nodes[i] || t.target === mainChart.tmp_nodes[i])
                    degree += parseInt(t.count);
            });
            mainChart.rMax = mainChart.rMax > degree ? mainChart.rMax : degree;

            var node = {id: mainChart.tmp_nodes[i], degree: degree};
            mainChart.nodes.push(node);
            mainChart.index_of_nodes.set(mainChart.tmp_nodes[i], i);
        }

        data.forEach(function (item) {
            mainChart.bMax = mainChart.bMax > parseInt(item.count) ? mainChart.bMax : parseInt(item.count);
            var link = {
                source: mainChart.index_of_nodes.get(item.source),
                target: mainChart.index_of_nodes.get(item.target),
                count: parseInt(item.count)
            };
            mainChart.links.push(link);
        });

        mainChart.rScale.domain([1, mainChart.rMax]);
        mainChart.bScale.domain([1, mainChart.bMax]);

        mainChart.svg = d3.select("#main")
            .append("svg")
            .attr("width", mainChart.width)
            .attr("height", mainChart.height);

        mainChart.force = d3.layout.force()
            .nodes(mainChart.nodes)
            .links(mainChart.links)
            .size([mainChart.width, mainChart.height])
            .linkDistance(40)
            .charge([-50])
            .start();

        mainChart.svg_links = mainChart.svg.selectAll(".link")
            .data(mainChart.links)
            .enter()
            .append("line")
            .attr("class", "link")
            .attr("stroke-opacity", 0.5)
            .attr("stroke", "gray")
            .attr("stroke-width", function (d) {
                return mainChart.bScale(d.count);
            });

        mainChart.svg_nodes = mainChart.svg.selectAll(".node")
            .data(mainChart.nodes)
            .enter()
            .append("circle")
            .attr("class", "node")
            .attr("r", function (d) {
                return mainChart.rScale(d.degree);
            })
            .attr("opacity", 0.7)
            .attr("fill", "#0CC5E8")
            .call(mainChart.force.drag);

        mainChart.force.on("tick", function () {
            mainChart.svg_links.attr("x1", function (d) {
                return d.source.x;
            });
            mainChart.svg_links.attr("y1", function (d) {
                return d.source.y;
            });
            mainChart.svg_links.attr("x2", function (d) {
                return d.target.x;
            });
            mainChart.svg_links.attr("y2", function (d) {
                return d.target.y;
            });

            mainChart.svg_nodes.attr("cx", function (d) {
                return d.x;
            });
            mainChart.svg_nodes.attr("cy", function (d) {
                return d.y;
            });
        });
    });
}

MainChart();