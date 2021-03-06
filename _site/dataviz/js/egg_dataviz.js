// height and width of the egg_scatterplot
var egg_scatterplot_object;
var egg_scatterplot_w = 750;
var egg_scatterplot_h = 750;

var legend_object;

// list of empty type cells in database
var empty_things = {'':true, 'NA':true, 'na':true, 'missing': true, 'none': true, "": true};

// whole egg database
var egg_database;

// dictionary of colors by group
var color = d3.scale.ordinal()
  .domain(["Hymenoptera","Condylognatha","Antliophora","Neuropteroidea","Amphiesmenoptera","Polyneoptera","Palaeoptera","Apterygota","Psocodea"])
  .range(["#BE0000","#2E9B00","#2056CE","#E87425","#22CED5","#3A175F","#F2C406","#D454E2","#878787"]);

// dictionary of data types
var variable_dict = {"X2": "Width (mm)", 
                    "X1": "Length (mm)", 
                    "curv": "Angle of curvature (rad)",
                    "asym": "Asymmetry",
                    "vol": "Volume (mm3)",
                    "ar": "Aspect ratio",
                    "logX2": "Width (mm) - log10 scale", 
                    "logX1": "Length (mm) - log10 scale", 
                    "logvol": "Volume (mm3) - log10 scale", 
                    "logar": "Aspect Ratio - log10 scale", 
                    "sqasym": "Asymmetry - square root scale" , 
                    "sqcurv": "Angle of curvature (rad) - square root scale"};

// image tooltip div
var div = d3.select("#svg_div").append("div")  
    // referred to as image_tooltip
    .attr("class", "image_tooltip")   
    // usually invisible            
    .style("opacity", 0);

// minitext div in image tooltip
var minitext = div.append("div")
    .attr("id","minitext")
    .attr("class","minitext");
var minisource = div.append("div")
    .attr("id","minisource")
    .attr("class","minitext");

// minipic div in image tooltip
var minipic_div = div.append("div")
    .attr("class","minipic_div");

// image inside minipic div
var minipic = minipic_div.append("img")
    .attr("id","minipic");

// scatterplot axes
var x_axis_radio = "logar";
var y_axis_radio = "logvol";
var transform_axes = "2";

// Length and Width
var eggAxisy_svg;
var eggAxisx_svg;

    // limits
    var low_lim = 0
    var high_lim = 17

    var low_lim_log = -2.2
    var high_lim_log = 1.7

    var low_ar = 0;
    var high_ar = 30;
    var low_logar = -0.75;
    var high_logar = 1.5;

    var low_vol = 0;
    var high_vol = 500;
    var low_logvol = -6.5;
    var high_logvol = 3;

    var low_asym = 0;
    var high_asym = 1.5;
    var low_sqasym = 0;
    var high_sqasym = 1.25;

    var low_curv = 0;
    var high_curv = 3.5;
    var low_sqcurv = 0;
    var high_sqcurv = 1.9;

    // scales
    var eggScalex = d3.scale.linear()
                    // set the pixel range that d3 uses to build the scatterplot
                    .range([100,egg_scatterplot_w-100])
                    // choose the limits to display in that range
                    .domain([low_logar,high_logar]);
    var eggScaley = d3.scale.linear()
                    .range([100,egg_scatterplot_h-100])
                    .domain([high_logvol,low_logvol]);


    // axes
    var eggAxisx = d3.svg.axis()
                    .scale(eggScalex);
    var eggAxisy = d3.svg.axis()
                    .scale(eggScaley)
                    .orient("left");

    eggAxisx.ticks(10)
        .tickSize(0,0)

    eggAxisy.ticks(10)
        .tickSize(0,0)


var transform_dict = {"X1": "logX1", 
                    "X2": "logX2",  
                    "asym": "sqasym",  
                    "curv": "sqcurv",  
                    "vol": "logvol",  
                    "ar": "logar"};

function change_color() {
    color_radio = document.getElementsByName('color_radio');
    var var_color;
    for(var i = 0; i < color_radio.length; i++){
        if(color_radio[i].checked){
            var_color = color_radio[i].value;
        }
    }

    make_legend();

    var colours = ["#440154","#481568","#482677","#453781","#3F4788","#39108C"
    ,"#32648E","#2D718E","#287D8E","#238A8D","#1F968B","#20A386"
    ,"#29AF7F","#3CBC75","#56C667","#74D010","#94D840","#B8DE29"
    ,"#DCE318","#FDE725"];

    var heatmapColour = d3.scale.linear()
      .domain(d3.range(0, 1, 1.0 / (colours.length - 1)))
      .range(colours);

    if(var_color == "clade") {
        egg_scatterplot_object.selectAll(".egg_point")
            .style("fill", function(d) { return color(d["group"])
        });
    } else {
        color_lims = get_lims(var_color,false)
        var color_scale = d3.scale.linear()
            .domain([color_lims[0],color_lims[1]])
            .range([0,1]);
        egg_scatterplot_object.selectAll(".egg_point")
            .style("fill", function(d) {
                if(d[color_lims[2]] == "NA") {
                    return "#cccccc";
                } else {
                    d3.select(this).moveToFront()
                    return heatmapColour(color_scale(d[color_lims[2]]));
                }
        }); 
    }
}
    

function set_axes(low_x,high_x,low_y,high_y,var_x,var_y) {
    scale_x = d3.scale.linear()
        .range([100,egg_scatterplot_w-100])
        .domain([low_x,high_x]);
    scale_y = d3.scale.linear()
        .range([100,egg_scatterplot_h-100])
        .domain([high_y,low_y]);

    axis_x = d3.svg.axis()
        .scale(scale_x);
    axis_y = d3.svg.axis()
        .scale(scale_y)
        .orient("left");

    yAxisGrid = axis_y.ticks(10)
        .tickSize(-egg_scatterplot_w + 200,0)
        .orient("left");

    xAxisGrid = axis_x.ticks(10)
        .tickSize(-egg_scatterplot_h+ 200,0)
        .orient("bottom");

    egg_scatterplot_object.select(".x.axis")
        .call(axis_x);
    egg_scatterplot_object.select(".y.axis")
        .call(axis_y);

    egg_scatterplot_object.selectAll(".egg_point")   
        .transition()
        .duration(1000)
        .attr("cx", function(d) { 
            if(d[var_x] == "NA") {
                return 0;
            } else {
                return scale_x(parseFloat(d[var_x]));
            } 
        })
        .attr("cy", function(d) { 
            if(d[var_y] == "NA") {
                return 0;
            } else {
                return scale_y(parseFloat(d[var_y]));
            } 
        });
    egg_scatterplot_object.selectAll(".egg_point")
        .attr("display", function(d) { 
            if ((d[var_y] in empty_things) || (d[var_x] in empty_things)) { 
                return "none";
            } else {
                return "block";
            } 
        });
    eggAxisx_svg.select("#x_title")
        .text(variable_dict[var_x]);
    eggAxisy_svg.select("#y_title")
        .text(variable_dict[var_y]);
}

function get_lims(variable,transform) {
    if(variable == "X1" | variable == "X2") {
        if(transform == true){
            low = low_lim
            high = high_lim
        } else {
            low = low_lim_log
            high = high_lim_log
            variable = transform_dict[variable]
        }
    } else if(variable == "vol") {
        if(transform == true){
            low = low_vol
            high = high_vol
        } else {
            low = low_logvol
            high = high_logvol
            variable = transform_dict[variable]
        }
    } else if(variable == "ar") {
        if(transform == true){
            low = low_ar
            high = high_ar
        } else {
            low = low_logar
            high = high_logar
            variable = transform_dict[variable]
        }
    } else if(variable == "asym") {
        if(transform == true){
            low = low_asym
            high = high_asym
        } else {
            low = low_sqasym
            high = high_sqasym
            variable = transform_dict[variable]
        }
    } else if(variable == "curv") {
        if(transform == true){
            low = low_curv
            high = high_curv
        } else {        
            low = low_sqcurv
            high = high_sqcurv
            variable = transform_dict[variable]
        }
    }
    return [low,high,variable]
}

function change_axes() {
    x_axis_radio = document.getElementsByName('x_axis_radio');
    var var_x;
    for(var i = 0; i < x_axis_radio.length; i++){
        if(x_axis_radio[i].checked){
            var_x = x_axis_radio[i].value;
        }
    }
    
    y_axis_radio = document.getElementsByName('y_axis_radio');
    var var_y;
    for(var i = 0; i < y_axis_radio.length; i++){
        if(y_axis_radio[i].checked){
            var_y = y_axis_radio[i].value;
        }
    }   
    
    transform_axes = document.getElementById("transform_slider").checked;

    var x_lims = get_lims(var_x,transform_axes);
    var y_lims = get_lims(var_y,transform_axes);

    set_axes(x_lims[0],x_lims[1],y_lims[0],y_lims[1],x_lims[2],y_lims[2]);
}

d3.selection.prototype.moveToFront = function() {  
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};


function highlight_searched() {
    highlight_select = document.getElementById("input_search").value;
    var highlight = highlight_select.toUpperCase().replace(/ /g,"_");
    if (highlight != "") { 
         egg_scatterplot_object.selectAll(".egg_point")
        .style("stroke",function (d) {
            for (var k in d) {
                if (d[k].toUpperCase() == highlight) {
                    d3.select(this).moveToFront()
                    return "black";
                }
            }
        })
        .style("opacity",function (d) {
            for (var k in d) {
                if (d[k].toUpperCase() == highlight) {
                    d3.select(this).moveToFront()
                    return "1";
                }
            }
        });
    } else {
        egg_scatterplot_object.selectAll(".egg_point")
            .style("stroke","none")
            .style("opacity", 1)
    };        
}

function imageExists(image_url){
    // check if an image file is found
    var http = new XMLHttpRequest()
    http.open("HEAD", image_url, false)
    http.send()

    return http.status != 404;
}

function make_legend() {
    color_radio = document.getElementsByName('color_radio');
    var var_color;
    for(var i = 0; i < color_radio.length; i++){
        if(color_radio[i].checked){
            var_color = color_radio[i].value;
        }
    }

    var legend;

    var colours = ["#440154", "#482878", "#3E4A89", "#31688E", "#26828E", "#1F9E89", 
    "#35B779", "#6DCD59", "#B4DE2C", "#FDE725"];

    var heatmapColour = d3.scale.linear()
        .domain(d3.range(0, 1, 1.0 / (colours.length - 1)))
        .range(colours);

    if(var_color == "clade") {
        legend_object.selectAll("g")
            .attr("display","none");

        legend = legend_object.selectAll(".legend")
            .data(color.domain())
            .enter().append("g")
            .attr("transform", function (d, i) { return "translate(0," + i * 25 + ")"; });

        legend.append("circle")
                .attr("class","legend_circle")
                .attr("cx",13)
                .attr("cy",14)
                .attr("r", 6)
                .attr("fill", color);

        legend.append("text")
                .attr("fill","#000000")
                .attr("x",30)
                .attr("y",14)
                .attr("dy", ".35em")
                .text(function(d) { return d; });  
    } else {
        legend_object.selectAll("g")
            .attr("display","none");

        var color_lims = get_lims(var_color,false)

        var color_scale = d3.scale.linear()
            .range([color_lims[0],color_lims[1]])
            .domain([0,1]);

        legend = legend_object.selectAll(".legend")
            .data(heatmapColour.domain())
            .enter().append("g")
            .attr("transform", function (d, i) { return "translate(0," + i * 25 + ")"; });

        legend.append("rect")
                .attr("x",10)
                .attr("y",2)
                .attr("width", 30)
                .attr("height", 25)
                .attr("fill", heatmapColour);

        legend.append("text")
                .attr("fill","#000000")
                .attr("x",50)
                .attr("y",15)
                .attr("dy", ".35em")
                .text(function(d) {
                    if (var_color == "asym" | var_color == "curv") {
                        return Math.pow(color_scale(d),2).toFixed(2);                    
                    } else { 
                        return Math.pow(10,color_scale(d)).toFixed(2); 
                    }
                });  
    }      
}

function show_image_tooltip(datum) {
    // build the text box next to the point
    minitext.html( "<i>" + datum["genus"] + " " + datum["species"] + "</i>");

    var source = "data/bibliography_formatted.csv";
    var bibkeys = {};
    d3.tsv(source, (bibdata) => {
        bibdata.map(d => {
            bibkeys[d["bibkey"]] = d["reference"];
            return bibkeys;   
        });
        minisource.html(bibkeys[datum["bibtex"]])    
    });

    // this is the name of the picture file
    var picturename = "ID" + datum["ID"] + ".png"
    var urlname = "pics/Entry_PNGs_cropped/" + picturename;
    // check if it is real
    var img_flag = imageExists(urlname);

    // transition in the image tooltip div
    div.transition()        
        .duration(20)   
        .style("opacity", 1.0);

    if(img_flag) {
        // if the image is present, show the pic
        minipic.style("opacity",1)
        minipic.attr("src",urlname);

    } else {
        // otherwise just show the text
        minipic.style("opacity",0);

    }
    
}

function make_egg_scatterplot() { 
    // set up the axes
    eggAxisx_svg = egg_scatterplot_object.append("g")
        .attr("class", "x axis")
        .call(eggAxisx)
        .attr("transform", "translate(0," + eggScaley(low_logvol) + ")");
    eggAxisy_svg = egg_scatterplot_object.append("g")
        .attr("class", "y axis")
        .call(eggAxisy)
        .attr("transform", "translate(" + eggScalex(low_logar) + ", 0)");
    // add text to the axes
    eggAxisy_svg.append("text")
        .attr("text-anchor", "middle")
        // move the text to the middle of the axis
        .attr("transform", "translate("+ -45 +","+((egg_scatterplot_h-80) / 2)+")rotate(-90)")
        .text(variable_dict[y_axis_radio])
        .attr("id", "y_title");
    eggAxisx_svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate("+ ((egg_scatterplot_w-40) / 2) +","+(40)+")")
        .text(variable_dict[x_axis_radio])
        .attr("id", "x_title");

        // grid
    var yAxisGrid = eggAxisy.ticks(10)
        .tickSize(-egg_scatterplot_w + 200,0)
        .orient("left");

    var xAxisGrid = eggAxisx.ticks(10)
        .tickSize(-egg_scatterplot_h+ 200,0)
        .orient("bottom");

    eggAxisx_svg.append("g")
        .call(xAxisGrid);

    eggAxisy_svg.append("g")
        .call(yAxisGrid);

    egg_scatterplot_object.append("rect")
        .attr("class","scatter_border")
        .attr("x",100)
        .attr("y",100)
        .attr("width",egg_scatterplot_w-200)
        .attr("height",egg_scatterplot_h-200);

    // build all of the points using d3
    egg_scatterplot_object.selectAll(".egg_point")
        .data(egg_database)
        .enter()
        // add points for each egg description
        .append("circle")
            .attr("class", "egg_point")
            // set the fixed qualities of the points
            .attr("stroke-width", 2)
            .attr("opacity", 1)
            // check for egg measurements, display point if present
            .attr("display", function(d) { 
                var y_key = y_axis_radio;
                var x_key = x_axis_radio;
                if ((d[y_key] in empty_things) || (d[x_key] in empty_things)) { 
                    return "none";
                } else {
                    return "block";
                } 
            })
            // color the points by group
            .style("fill", function(d) { return color(d["group"])
            })
            // determine the position of the points based on measurement
            .attr("cy", function(d) {
                var y_key = y_axis_radio;
                if (d[y_key] in empty_things) { 
                    return 0;
                } else {
                    return eggScaley(parseFloat(d[y_axis_radio]));
                } 
            })
            .attr("cx", function(d) {
                var x_key = x_axis_radio;
                if (d[x_key] in empty_things) { 
                    return 0;
                } else {
                    return eggScalex(parseFloat(d[x_axis_radio]));
                }
            })
            // determine the size of the points based on image
            .attr("r", function(d) {
                if(d["image"] in empty_things) {
                    return 2.5;
                } else {
                    return 4;
                }
            })
            // set up the mouseover image_tooltip
            .on("mouseover", function(d){
                show_image_tooltip(d);
            })
            // make the image_tooltip div go away when you mouseout
            .on("mouseout", function(d){
                div.transition()        
                    .duration(500)      
                    .style("opacity", 0);
                minipic.attr("src",'pics/tinytrans.gif');
            });
}

function load_egg_database() {
    // get list of keys
    data_keys = Object.keys(egg_database[0]);

    // call the object named svg_dv, make it an svg with a given height
    egg_scatterplot_object = d3.select("#svg_div")
        .append("svg")
            // its name is egg_scatterplot
            .attr("class", "egg_scatterplot")
            .attr("width", egg_scatterplot_w)
            .attr("height", egg_scatterplot_h);

    // call the object named color_legend
    legend_object = d3.select("#color_legend")
        .append("svg")
        .attr("height","250")
        .attr("width","250")

    // make the scatterplot svg
    make_egg_scatterplot();
    make_legend();

}

function read_data() { 
    //read in explain data
    d3.tsv("data/dataviz_egg_database.csv", function(data1) {

        //Hand CSV data off to global var
        egg_database = data1;

        //Call some other functions
        load_egg_database(); 

    }); 
}