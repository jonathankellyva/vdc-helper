### Overview

The Voices.com Helper is a script that improves the user interface of Voices.com in a number of ways.
For a list of new changes made in each version, see
[here](https://github.com/jonathankellyva/vdc-helper/wiki/What's-New).

### Installation

1. Install the Tampermonkey browser plugin from https://tampermonkey.net  
   It works for Chrome, Microsoft Edge, Firefox, Safari, and Opera Next.  
   On mobile, you can also use it with Firefox for Android by installing the plugin from
   https://addons.mozilla.org/en-US/android/addon/tampermonkey/
2. Some browsers might require additional configuration for Tampermonkey to run Userscripts.
   For example, Google Chrome and Microsoft Edge require Developer Mode to be enabled.
   (See https://www.tampermonkey.net/faq.php?locale=en#Q209)
3. To install this Userscript, visit
   https://github.com/jonathankellyva/vdc-helper/raw/stable/vdc-helper.user.js

### Contributing

This tool is completely free and open source, but if you would like to
[send me a tip](https://tiptopjar.com/jskva), I would really appreciate it!

Thank you,
<br />Jonathan Kelly

### Features

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
  Instead, add an icon next to job ID at top of the page.

* Hide Performance Details sections that just say "N/A" anyway.

* Display controls for playing reference audio and video along with the Download links so that you
  can play them directly in the page rather than having to download them and open them separately.
  Similarly, if any YouTube links appear in the references, embed them directly into the page.

* Display reference/script PNG images directly in the page rather than having to download them and
  open them separately.

* For jobs you've responded to, add audio controls to play your audition right above the Sample
  Script. This makes it much easier to play back your audition while reading the script without
  having to open both the Job Details and My Response pages in separate tabs.

* Allow editing Sample Scripts by clicking on them.  
  On Mac, hold Command and click on the script.  
  On Windows, hold the Windows key and click on the script.  
  On mobile, long press on the script.  
  Edits are saved across page loads, but you can restore the original text with the Reset button.

* Show the total number of words in the Sample Script.
  When selecting any words in the script, also show the number of selected words.

* Automatically expand Sample Script rather than requiring you to click Read More.

* In the Performance Details sections, turn URLs into actual links so that you can click them.
  The links are usually to things like the company's website or YouTube/Vimeo references or
  things like that, so it's helpful to be able to click them instead of having to copy-paste
  them into the address bar of a new tab.  Note that these links will open in a new tab.

* In Licensing Details, highlight in-perp ads in red and other ads in green so they stand out.
  Also, make ad licensing durations more concise and readable.
  (e.g., "0 Years: 0 Months: 5 Weeks" => "5 Weeks")
  Add a GVAA Rate Guide link next to each ad (currently supporting Online, Radio, and TV).

* Highlight Live Directed Session tags (i.e., the little bubbles that say "Zoom", "Source Connect",
  etc.) in gold so that they stand out.

#### Job Response Editor

* Allow selecting a response template that should be automatically filled in by default.

* Automatically fill in the max budget for the bid.

* Highlight in-perp ads in red and other ads in green, and add GVAA links, just like is done on the
  Job Details page.

#### Statistics Page

* Automatically show listen % and shortlist %s.

* Hide dollar amounts on the Statistics page by default.
  Click on the dollar amount to show it.
  This could be helpful when sharing your screen.

* Allow filtering Audition History by Listened/Shortlisted.

#### Other

* On the Answered Jobs page and in the Audition History of the Statistics page, link to the job
  posting rather than your response. Personally, I usually want to view the job posting rather than
  my response anyway, so I figured I might as well link to that by default.

### Upcoming Feature Ideas

* For VoiceMatch <100%, I'd like to figure out a way to help you determine why it was <100%.
* If possible, calculate the recommended GVAA rate range based on licensing details.
* Popup notifications when you receive a new invitation/listen/shortlist/booking.
* Show number of business days until Project Deadlines.
* On Statistics page, allow sorting the Demo History table by each different column.
