chrome.action.onClicked.addListener(async function(tab) {
  try {
    // Check if the tab is valid and accessible
    if (tab && tab.id) {
      // Execute the highlighter.js script in the current tab
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['highlighter.js']
      });

      // Set the badge text to 'ON' to indicate the script has been executed
      chrome.action.setBadgeText({ text: 'ON' });

      // Optionally clear the badge after 2 seconds
      setTimeout(() => {
        chrome.action.setBadgeText({ text: '' }); // Clear the badge text
      }, 2000);

      console.log('Script executed successfully.');
    } else {
      console.error('Tab is not valid.');
    }
  } catch (error) {
    console.error('Error executing script:', error);
  }
});
