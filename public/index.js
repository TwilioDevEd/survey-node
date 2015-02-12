$(function() {

    // Chart ages
    function ages(results) {
        // Collect age results
        var data = {};
        for (var i = 0, l = results.length; i<l; i++) {
            var ageResponse = results[i].responses[0];
            var k = String(ageResponse.answer);
            if (!data[k]) data[k] = 1;
            else data[k]++;
        }

        // Assemble for graph
        var labels = Object.keys(data);
        var dataSet = [];
        for (var k in data)
            dataSet.push(data[k]);

        // Render chart
        var ctx = document.getElementById('ageChart').getContext('2d');
        var ageChart = new Chart(ctx).Bar({
            labels: labels,
            datasets: [
                {
                    label: 'Ages',
                    data: dataSet
                }
            ]
        });
    }

    // Chart yes/no responses to lemur question
    function lemurs(results) {
        // Collect lemur kicking results
        var yes = 0, no = 0;
        for (var i = 0, l = results.length; i<l; i++) {
            var lemurResponse = results[i].responses[1];
            lemurResponse.answer ? yes++ : no++;
        }

        var ctx = document.getElementById('lemurChart').getContext('2d');
        var ageChart = new Chart(ctx).Pie([
            { value: yes, label: 'Yes', color: 'green', highlight: 'gray' },
            { value: no, label: 'No', color: 'red', highlight: 'gray' }
        ]);
    }

    // poor man's html template for a response table row
    function row(response) {
        var tpl = '<tr><td>';
        tpl += response.answer || 'pending...' + '</td>';
        if (response.recordingUrl) {
            tpl += '<td><a target="_blank" href="'
                + response.recordingUrl 
                + '"><i class="fa fa-play"></i></a></td>';
        } else {
            tpl += '<td>N/A</td>';
        }
        tpl += '</tr>';
        return tpl;
    }

    // add text responses to a table
    function freeText(results) {
        var $responses = $('#turtleResponses');
        var content = '';
        for (var i = 0, l = results.length; i<l; i++) {
            var turtleResponse = results[i].responses[2];
            content += row(turtleResponse);
        }
        $responses.append(content);
    }

    // Load current results from server
    $.ajax({
        url: '/results',
        method: 'GET'
    }).done(function(data) {
        // Update charts and tables
        $('#total').html(data.results.length);
        lemurs(data.results);
        ages(data.results);
        freeText(data.results);
    }).fail(function(err) {
        console.log(err);
        alert('failed to load results data :(');
    });
});