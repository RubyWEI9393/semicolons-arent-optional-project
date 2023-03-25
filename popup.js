const BASE_PROMPT = "categorize the tabs into different groups by similarity according to their titles into this format: \n" +
    "```\n" +
    "[{\"label\": \"\", \"tabIds\":[\"\", \"\", \"\"...]}, {\"label\": \"\", \"tabIds\":[\"\", \"\", \"\"...]}, ....]\n" +
    "```\n" +
    "\n";

const API_KEY = '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';

const organizeTabs = async () => {
    const tabs = await chrome.tabs.query({});   

    const parsedTabs = []
    for (var i = 0; i < tabs.length; i++) {
        parsedTabs.push({
            tabId: tabs[i].id,
            title: tabs[i].title
        });
    }

    const client = axios.create({
        headers: { 'Authorization': 'Bearer ' + API_KEY }
    });

    const params = {
    prompt: BASE_PROMPT + JSON.stringify(parsedTabs),
    model: "text-davinci-003", 
    max_tokens: 1000,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0
    }
    
    client.post('https://api.openai.com/v1/completions', params)
    .then( response => {

        const groupings = JSON.parse(response.data.choices[0].text);
        
        groupings.forEach(async (grouping) => {
            const groupId = await chrome.tabs.group({ tabIds: grouping.tabIds });
            const tabGroups = await chrome.tabGroups;
            tabGroups.update(groupId, {
                 collapsed: false,
                 title: grouping.label
                });
        })
    }).catch( error  => {
        console.log(error);
    });


}
const init = () => {
    const button = document.querySelector("button");
    button.addEventListener("click", organizeTabs);
}

init();

