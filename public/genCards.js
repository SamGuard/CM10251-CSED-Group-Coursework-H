Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});
Date.prototype.toHumanReadableDate = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    dateSplit = local.toJSON().slice(0,10).split("-")
    return dateSplit[2] + "/" + dateSplit[1] + "/" + dateSplit[0];
});
DayInMilis = 86400000
cookiedata = document.cookie.split(";")[0].split("=")[1].split(":")
tabs=["#inputs", "#inputsLeaderboard"]
async function getAllCards(){
    $.get("/data/user-activities", {username: cookiedata[0], password: cookiedata[1]}, async function (data, status) {
        dataJson = JSON.parse(data);
        dataArray=dataJson.data
        for (p=0;p<dataArray.length;p++){
            cur = dataArray[p]
            await addCard(cur.name, cur.description, cur.record_unit, cur.ID)
        }
    });
}

function submit(id){
    let name = 'amount'+id
    value = document.getElementById(name).value
    if (value != ""){
        $.post("/data/add-record", {username: cookiedata[0], password: cookiedata[1], sportID:id, record:value, date:(new Date(document.getElementById('date'+id).value).getTime()  - 1000*60*60)}, function (data, status) {
            dataJson = JSON.parse(data);
            if (dataJson.success){
                success(document.getElementById(name), document.getElementById(name+'error'))
                window.location.reload(false);
            } else{
                document.getElementById(name+'error').innerHTML = dataJson.reason
                error(document.getElementById(name), document.getElementById(name+'error'))
            }
        });
    }
}

async function getUserDataFromSport(id){
    returnedData = []
    $.ajax({
        async: false,
        type: 'GET',
        url: "/data/user-sport-records",
        data: {username: cookiedata[0], password: cookiedata[1], sportID:id},
        success: function (data, status) {
            dataJson = JSON.parse(data);
            for (i=0;i<dataJson.data.length;i++){
                var coeff = 1000 * 60 * 60 * 24; // round to nearest day
                var rounded = (Math.round(dataJson.data[i]._date / coeff) * coeff - 1000*60*60) // minus an hour as it rounds to 1 am
                returnedData.push({id:dataJson.data[i].ID, date: rounded, value:dataJson.data[i].record})
            }
        }
    });
    return returnedData
}

async function addCard(title, description, unit, id){
    let chartName = 'chart' + id
    // add the card to html
    document.getElementById("cards").innerHTML += '<!--'+id+'-->'+
    '<div id=\"'+id+'\" class=\"sportCard card\">'+
    '<div>'+
    '<h2 style="float:left;clear:left;">'+title+' (ID:'+id+')</h2>'+
    '<span onclick=\"removeCard(\''+id+'\')\" style=\"float:right;\" class=\"close noselect\">&times;</span>'+
    '<span onclick=\"createLeaderboard(\''+id+'\')\" style=\"float:right;background: var(--tertiary-bg-color);\" class=\"close noselect\">Create Leaderboard</span>'+
    '</div>'+
    '<div style="min-width: 850px;" id="tabs'+id+'">'+
    '<ul class="cardTabs">'+
    '<li><a href="#graphs'+id+'">Graphs</a></li>'+
    '<li><a href="#table'+id+'">Data</a></li>'+
    '<li><a href="#goals'+id+'">Goals</a></li>'+
    '</ul>'+
    '<div  id=graphs'+id+'>'+
    '<div style="margin-bottom:1%;" class=\"row\">'+
    '<h5 style="writing-mode: tb-rl;">'+unit+'</h5>'+
    '<div id=\"'+chartName+'"></div>'+
    '<div style="display:flex;flex-direction:column;flex-grow: 1;">'+
    '<h4>Record new session</h4>'+
    '<h5>Date:</h5>'+
    '<input type="date" id="date'+id+'" name="date" value="'+new Date().toDateInputValue()+'">'+
    '<h5>Amount:</h5>'+
    '<input type="text" id="amount'+id+'" oninput="forceBeInt(amount'+id+')" name="amount">'+
    '<h4></h4>'+
    '<button onclick="submit('+id+')" id="amount'+id+'button">Submit</button>'+
    '<div style="display: none;"  class="errorMessage" id="amount'+id+'error">Invalid ID</div>'+
    '</div>'+
    '</div>'+
    '</div>'+
    '<div id="table'+id+'" class=\"row\">'+
    '</div>'+
    '<div id="goals'+id+'" class=\"row\">'+
    '</div>'+
    '</div>'+
    '</div>'+
    '</div>'+
    '<!--'+id+'-->'
    //set up the tabss
    tabs.push("#tabs"+id)
    $( function() {
        $("#tabs"+id).tabs();
    });
    //get the data
    let data = await getUserDataFromSport(id)
    //set up the goals
    graphData=[]
    for (j=0;j<data.length;j++){
        graphData.push({x:data[j].date,y:data[j].value})
    }
    goals = getGoals(graphData);
    document.getElementById('goals'+id).innerHTML = "<div>"+
    "<h3>Goal for 1 day: "+Math.round(goals.oneday)+" "+unit+"</h3>"+
    "<h3>Goal for 1 week: "+Math.round(goals.oneweek)+" "+unit+"</h3>"+
    "<h3>Goal for 1 month: "+Math.round(goals.onemonth)+" "+unit+"</h3>"+
    "</div>"

    //add the graph to the card
    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 25, bottom: 30, left: 40},
    width = 600 - margin.left - margin.right,
    height = 180 - margin.top - margin.bottom;
    // append the svg object to the body of the page
    let svg = d3.select("#"+chartName)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");
    //set the x and y scale
    var x = d3.scaleTime()
    .domain(d3.extent(data, function(d) { return d.date; }))
    .range([ 0, width ]).nice();
    var y = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return +d.value; })])
    .range([ height, 0 ]);
    // Add the area
    svg.append("path")
    .datum(data)
    .attr("fill", "var(--forthary-faded-color)")
    .attr(
        "d", d3.area().curve(d3.curveMonotoneX)
        .x(function(d) { return x(d.date) })
        .y0(height).y1(function(d) { return y(d.value) })
    )
    // draw X axis
    var xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%d/%m/%y")).ticks(5)
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr("class", "axisColor")
    .call(xAxis);

    // draw Y axis
    svg.append("g")
    .attr("class", "axisColor")
    .call(d3.axisLeft(y));
    // draw the line ontop of the area
    svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "var(--forthary-bg-color)")
    .attr("stroke-width", 1.5)
    .attr(
        "d", d3.line().curve(d3.curveMonotoneX)
        .x(function(d) { return x(d.date) })
        .y(function(d) { return y(d.value) })
    )
    // draw the circles at the points of the graph
    var points = svg.selectAll(".point")
    .data(data)
    .enter().append("svg:circle")
    .attr("stroke", "var(--forthary-bg-color)")
    .attr("stroke-width", 1.5)
    .attr("fill", "var(--secondary-bg-color)")
    .attr("cx", function(d, i) { return x(d.date) })
    .attr("cy", function(d, i) { return y(d.value) })
    .attr("r", 3 );
    // creates the table with the records

    addstring=""
    for (i=0;i<data.length;i++){
        addstring += '<tr id="'+data[i].id+'">'+
        '<td>'+new Date(data[i].date).toHumanReadableDate()+'</td>'+
        '<td>'+data[i].value+'</th>'+
        '<td><a onclick="removeRecord('+data[i].id+')" style="cursor: pointer;text-decoration: underline red;color:red">Remove</a></td>'+
        '</tr>'
    }
    document.getElementById('table'+id).innerHTML = '<table style="width:100%">'+
    '<tr>'+
    '<th>Date</th>'+
    '<th>Value</th>'+
    '<th>Remove</th>'+
    '</tr>'+
    addstring;
    document.getElementById('table'+id).innerHTML += '</table>'
    for(tabi=0;tabi<tabs.length;tabi++){
        $(tabs[tabi]).tabs().tabs( "refresh" );
    }
}


function openRecords(id){
    document.getElementById('table'+id).style.display = document.getElementById('table'+id).style.display == "none" ? "": "none"
}

function removeRecord(id){
    $.post("/data/remove-record", {username: cookiedata[0], password: cookiedata[1], recordID:id}, function (data, status) {
        document.getElementById(id).style.display = "none";
        window.location.reload(false);
    });
}

function getGoals(data){
    if(data.length <= 1){
        return []
    }
    totalx=0
    totaly=0
    for (i=0;i<data.length;i++){
        totalx+= data[i].x
        totaly+= data[i].y
    }
    meanx=totalx/data.length
    meany=totaly/data.length

    numer = 0
    denom = 0
    for (i=0;i<data.length;i++){
        numer += (data[i].x - meanx)*(data[i].y - meany)
        denom += (data[i].x - meanx)*(data[i].x - meanx)
    }
    m = numer / denom
    c = meany - (m * meanx)

    goals={oneday:m*(data[data.length-1].x+DayInMilis)+c,oneweek:m*(data[data.length-1].x+7*DayInMilis)+c,onemonth:m*(data[data.length-1].x+30*DayInMilis)+c}

    return goals
}

function removeCard(id){
    currentCard='<!--'+id+'-->'
    curCard = document.getElementById("cards").innerHTML.split(currentCard)
    document.getElementById("cards").innerHTML = curCard[0] + curCard[2]
    for(tabi=0;tabi<tabs.length;tabi++){
        console.log(tabs[tabi]);
        $(tabs[tabi]).tabs().tabs( "refresh" );
    }
}

function addLeaderboard(id){

}
