### Overview

The Voices.com Helper is an unofficial (i.e., not affiliated with or developed by Voices.com) browser extension that
improves the user interface of Voices.com in a number of ways.

For a list of new changes made in each version, including screenshots of each feature in action, see the
[What's New](https://github.com/jonathankellyva/vdc-helper/wiki/What's-New) page.

### Installation

Each type of browser has their own repository for browser extensions. Please follow the instructions below
for the browser you are using.

#### Google Chrome

Install the browser extension from the
[Chrome Web Store](https://chromewebstore.google.com/detail/voicescom-helper/ehkgogjjjmhlibpmdnpabpocahhbfgni).

#### Firefox

Install the browser extension from the
[Firefox Browser Add-ons site](https://addons.mozilla.org/en-US/firefox/addon/vdc-helper/).

This extension also works on Firefox for Android, one of the only mobile browsers that supports
browser extensions.

#### Microsoft Edge

Install the browser extension from the
[Microsoft Edge Add-Ons site](https://microsoftedge.microsoft.com/addons/detail/voicescom-helper/bekfnbcgjdeapfmnececgjkbhfdenaco).

#### Safari

Unfortunately, the new browser extension is not yet available for Safari. Apple charges $99/year
in order for me to have an Apple Developer account, which is required in order to publish a
browser extension to the Safari Extensions Gallery. Since this is just a hobby for me, I cannot
justify paying this annual fee only for the sake of making this plugin available.

If there is enough demand for a browser plugin for Safari, and if I
[receive enough tips](https://tiptopjar.com/jskva) to support the annual Apple Developer account
fee, I can publish the extension to the Safari Extensions Gallery as well.

In the meantime, please use one of the supported browsers above instead.

### Contributing

This tool is completely free and open source, but if you would like to
[send me a tip](https://tiptopjar.com/jskva), I would really appreciate it!

Thank you,
<br />Jonathan Kelly

### Features

#### Notifications

Unfortunately, this feature is at least temporarily disabled because Voices.com seems to have made a change that broke it.

* ~~Pop up notifications when you receive a new job invitation or when a client listens to or
  shortlists one of your auditions. Clicking on the notification will open the corresponding
  job in a new tab.~~

#### Job Details Page

* Clicking on the Job Title copies the Job Title to the clipboard.  
  Similarly, clicking the Job ID copies the Job ID to the clipboard.  
  Finally, holding down one of the shift/alt/option/windows/command/ctrl keys while clicking on
  either the Job Title or Job ID will copy both the Job ID and Job Title to the clipboard.  
  e.g., "12345 - Awesome Job". This can be useful when naming a project in your DAW.

* Move Client Details to a single, compact line at the top of the page under the job title/ID.
  This is nicer than having to scroll all the way to the bottom just to see how many reviews the
  client has, where they're from, etc.

* Hide "Managed Services Payment Policy" block on the top of Job Details page.

* For job invitations with VoiceMatch <100%, the VoiceMatch % and any non-matching tags
  (category, language, voice age, accent, role, style) will be highlighted in red. Clicking on them
  will pop up a dialog box that displays all of your demos sorted by how well they match the
  current job.

* Hide Performance Details sections that just say "N/A" anyway.

* Display controls for playing reference audio and video along with the Download links so that you
  can play them directly in the page rather than having to download them and open them separately.
  Similarly, if any YouTube/Vimeo links appear in the references, embed them directly into the page.

* Similarly, display reference/script PNG/JPG images directly in the page rather than having to
  download them and open them separately.

* Add a View link next to the Download link for DOCX reference files and sample scripts. Also add
  one for PDF reference files. (For some reason, Voices.com adds a View link for PDF sample scripts
  but not PDF reference files.) These will pop up the document in a new tab (using Google Docs
  Viewer) so that you don't have to download them and open them in a separate application.

* For jobs you've responded to, add audio controls to play your audition right above the Sample
  Script. This makes it much easier to play back your audition while reading the script without
  having to open both the Job Details and My Response pages in separate tabs. You can also see here
  whether or not your audition was listened to and/or shortlisted by the client.

* Allow editing Sample Scripts by clicking on them.  
  On Mac, hold Command and click on the script.  
  On Windows, hold the Windows key and click on the script.  
  On mobile, long press on the script.  
  There is also an Edit link next to the Sample Script header.  
  Edits are saved across page loads, but you can restore the original text with the Reset button.

* You can click the Copy link next to the Sample Script to copy it to the clipboard.

* You can click the Pop Out link next to the Sample Script to pop it out to its own small window.

* Show the total number of words in the Sample Script.
  When selecting any words in the script, also show the number of selected words.

* Automatically expand Sample Script rather than requiring you to click Read More.

* In the Performance Details sections, turn URLs into actual links so that you can click them.
  The links are usually to things like the company's website or YouTube/Vimeo references or
  things like that, so it's helpful to be able to click them instead of having to copy-paste
  them into the address bar of a new tab.  Note that these links will open in a new tab.

* In the Job Highlights, highlight the budget in red if it is below $100.

* Add a [GVAA Rate Guide](https://globalvoiceacademy.com/gvaa-rate-guide-2/) link next to the category.

* Calculate and display PFH (Per Finished Hour) rates under the Budget in the Job Highlights for
  audiobooks and anything else that is longer than 20 mins.

* In Licensing Details, highlight in-perp ads in red and other ads in green so they stand out.
  Also, make ad licensing durations more concise and readable.
  (e.g., "0 Years: 0 Months: 5 Weeks" => "5 Weeks")
  Add a [GVAA Rate Guide](https://globalvoiceacademy.com/gvaa-rate-guide-2/) link next to each ad
  (currently supporting Online, Radio, and TV).

* Highlight Live Directed Session tags (i.e., the little bubbles that say "Zoom", "Source Connect",
  etc.) in gold so that they stand out.

#### Job Response Editor

* Allow selecting a response template that should be automatically filled in by default.

* Automatically fill in the max budget for the bid.

* Highlight in-perp ads in red and other ads in green, and add GVAA links, just like is done on the
  Job Details page.

* Calculate and display PFH (Per Finished Hour) rates under the Job Budget in the Job Highlights
  section and under the Your Earnings and Your Quote fields, both for audiobooks and for anything
  else that is longer than 20 mins.

#### Jobs List Pages

* Highlight a job's budget in red if it is below $100.

* On the Answered Jobs page, link to the Job Details page rather than to your response. Personally, I usually want to
  view the job posting rather than my response anyway, so I figured I might as well link to that by default.

#### Statistics Page

* Automatically show listen % and shortlist %s.

* Hide dollar amounts on the Statistics page by default.
  Click on the dollar amount to show it.
  This could be helpful when sharing your screen.

* Allow filtering Audition History by Listened/Shortlisted.

* In the Audition History, link to the Job Details page for each job rather than to the Job Response page.

### Upcoming Feature Ideas

* Pop up notifications when you receive a booking.
* If possible, calculate the recommended GVAA rate range based on licensing details.
* Show number of business days until Project Deadlines.
* On Statistics page, allow sorting the Demo History table by each different column.
