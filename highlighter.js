// Fetch the dataset from the extension's files
var fileUrl = chrome.runtime.getURL('dataset.txt');
console.log("Dataset URL: ", fileUrl);

fetch(fileUrl)
    .then(response => response.text())
    .then(content => {
        // Split the content into words and categories
        const arr = content.split('\n').filter(Boolean);
        const words = arr.map(element => element.replace('\r', ''));
        let matchCounter = 0;
        const categoryCounts = {
            "Forced Action": 0,
            "Baseless reassurance": 0,
            "Misguiding User Flow": 0,
            "False Scarcity": 0,
            "Social Proof": 0,
            "Hidden Subscription": 0,
            "False Affiliation": 0,
            "Negative Option": 0,
            "Upselling": 0,
            "Positive Reinforcement": 0,
            "Urgency": 0
        };

        // Process the DOM with TreeWalker for better performance
        const walker = document.createTreeWalker(
            document.body, 
            NodeFilter.SHOW_TEXT, 
            { acceptNode: function(node) { return NodeFilter.FILTER_ACCEPT; }},
            false
        );

        // Loop through text nodes
        let currentNode;
        while (currentNode = walker.nextNode()) {
            let originalText = currentNode.nodeValue;
            let updatedText = originalText;

            // Loop through words and check for matches
            for (let i = 0; i < words.length; i++) {
                const wordData = words[i].split('@');
                const word = wordData[0];
                const category = wordData[1];

                // Escape word for use in RegExp and create a global, case-insensitive pattern
                const regex = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'gi');

                // Replace the matched text with highlighted version
                if (regex.test(originalText)) {
                    matchCounter++;
                    // Update category count
                    if (category) {
                        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
                    }

                    updatedText = updatedText.replace(regex, match => {
                        return `<mark style="background-color: yellow; border: 2px solid red;">${match}</mark>`;
                    });
                }
            }

            // Only update the node if there are matches to avoid unnecessary changes
            if (updatedText !== originalText) {
                const span = document.createElement('span');
                span.innerHTML = updatedText;
                currentNode.replaceWith(span);
            }
        }

        // Send match data to popup.js or background script
        sendMatchData({ Total: matchCounter, Categories: categoryCounts });
    })
    .catch(error => {
        console.error("Error fetching dataset:", error);
    });

// Utility function to escape special characters for regex
function escapeRegExp(string) {
    return string.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, '\\$&');
}

// Function to send match data
function sendMatchData(data) {
    chrome.runtime.sendMessage({ action: 'sendMatchData', matchData: data });
}
