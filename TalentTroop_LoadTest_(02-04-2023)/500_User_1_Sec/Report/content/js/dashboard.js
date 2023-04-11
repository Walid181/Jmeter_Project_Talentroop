/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 86.6453418632547, "KoPercent": 13.354658136745302};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.020659780073308896, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.109, 500, 1500, "api/applicant-info/profile"], "isController": false}, {"data": [0.0, 500, 1500, "Login"], "isController": false}, {"data": [0.0, 500, 1500, "Test Fragment"], "isController": true}, {"data": [0.007, 500, 1500, "api/job-post/employer/details -1"], "isController": false}, {"data": [0.006, 500, 1500, "api/job-post/employer/details -2"], "isController": false}, {"data": [0.002, 500, 1500, "api/job-post/list/talentViewwithOrgId"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2501, 334, 13.354658136745302, 9301.65613754501, 0, 37117, 6579.0, 20515.40000000001, 24450.3, 29547.180000000004, 1.5007906004062515, 117.77179725262609, 0.6819526236081983], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["api/applicant-info/profile", 500, 9, 1.8, 2080.6979999999994, 206, 12115, 2067.5, 2243.9, 4765.849999999999, 6294.380000000001, 9.72686950431873, 4.616501451735274, 4.3841204599836585], "isController": false}, {"data": ["Login", 501, 2, 0.3992015968063872, 15704.145708582824, 2150, 18793, 15611.0, 17095.8, 18354.4, 18679.0, 0.3006381810489932, 0.23972224159968317, 0.14902517619737707], "isController": false}, {"data": ["Test Fragment", 500, 233, 46.6, 46521.525999999954, 8090, 59308, 48218.5, 53927.3, 54765.95, 55743.86, 8.33694600993764, 3272.419936660053, 18.940580631815454], "isController": true}, {"data": ["api/job-post/employer/details -1", 500, 180, 36.0, 10303.655999999999, 21, 34941, 7654.0, 22895.300000000007, 26059.549999999992, 30377.67000000001, 9.947279419078882, 1524.8089228650651, 4.318051825325774], "isController": false}, {"data": ["api/job-post/employer/details -2", 500, 120, 24.0, 7090.907999999996, 0, 37117, 2331.0, 24450.3, 26744.0, 33814.05, 9.684667234833812, 509.4690320659332, 4.030599614066011], "isController": false}, {"data": ["api/job-post/list/talentViewwithOrgId", 500, 23, 4.6, 11316.067999999996, 172, 34445, 8738.5, 22287.2, 25886.699999999997, 28835.680000000004, 9.652695997992238, 1789.1700559192745, 4.586953597077164], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 207, 61.97604790419162, 8.276689324270292], "isController": false}, {"data": ["500/Internal Server Error", 2, 0.5988023952095808, 0.07996801279488205], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: api.test-applicant.talent-troop.com:443 failed to respond", 116, 34.73053892215569, 4.638144742103159], "isController": false}, {"data": ["Non HTTP response code: javax.net.ssl.SSLException/Non HTTP response message: Connection reset", 8, 2.395209580838323, 0.3198720511795282], "isController": false}, {"data": ["Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host terminated the handshake", 1, 0.2994011976047904, 0.03998400639744103], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2501, 334, "400/Bad Request", 207, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: api.test-applicant.talent-troop.com:443 failed to respond", 116, "Non HTTP response code: javax.net.ssl.SSLException/Non HTTP response message: Connection reset", 8, "500/Internal Server Error", 2, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host terminated the handshake", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["api/applicant-info/profile", 500, 9, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: api.test-applicant.talent-troop.com:443 failed to respond", 8, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host terminated the handshake", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Login", 501, 2, "400/Bad Request", 1, "500/Internal Server Error", 1, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["api/job-post/employer/details -1", 500, 180, "400/Bad Request", 159, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: api.test-applicant.talent-troop.com:443 failed to respond", 17, "Non HTTP response code: javax.net.ssl.SSLException/Non HTTP response message: Connection reset", 4, "", "", "", ""], "isController": false}, {"data": ["api/job-post/employer/details -2", 500, 120, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: api.test-applicant.talent-troop.com:443 failed to respond", 70, "400/Bad Request", 46, "Non HTTP response code: javax.net.ssl.SSLException/Non HTTP response message: Connection reset", 3, "500/Internal Server Error", 1, "", ""], "isController": false}, {"data": ["api/job-post/list/talentViewwithOrgId", 500, 23, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: api.test-applicant.talent-troop.com:443 failed to respond", 21, "400/Bad Request", 1, "Non HTTP response code: javax.net.ssl.SSLException/Non HTTP response message: Connection reset", 1, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
