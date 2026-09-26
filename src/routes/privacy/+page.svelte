<script lang="ts">
  import DocPage from "$lib/components/DocPage.svelte";
</script>

<DocPage title="Privacy" sub="Last updated September 26, 2026" other={{ href: "/terms", label: "Terms of Use" }}>
  <p>
    PitMaster (<a href="https://pitmaster.cc">pitmaster.cc</a>) is a free side project, built entirely by one person
    and published by Wyzie LLC (“we”, “us”). It's built so your games never have to leave your device, and this page
    says exactly when something does.
  </p>

  <div class="block short">
    <b>The Short Version</b>
    <ul>
      <li>There are no accounts and no database of your games. We don't know who you are.</li>
      <li>Everything you enter is saved in this browser, on this device, encrypted with a key only this browser holds. Add a passcode and nothing opens without it. We can't see any of it, and we can't recover it if it's lost.</li>
      <li>The one exception: while a game has a TV code, an encrypted copy of it sits on our server so other screens can show it. It's locked with a key made from the TV code, which we never see, and it's deleted when you stop sharing, or two days after it last changed.</li>
      <li>No ads, no analytics, no tracking cookies and no third-party scripts.</li>
    </ul>
  </div>

  <h2>What's Saved on Your Device</h2>
  <p>PitMaster keeps everything in your browser's storage:</p>
  <ul>
    <li>Games: players' names, buy-ins, cash-outs, rebuys, knockouts, seats, payouts, deals, the game log and notes.</li>
    <li>Your chip sets and templates.</li>
    <li>The Venmo, Cash App and PayPal names you save for players.</li>
    <li>Your settings.</li>
  </ul>
  <p>
    All of it is encrypted with AES-256-GCM before it's stored. Your browser makes the key at random on your first visit
    and keeps it so that no script, ours included, can read it out; it can only be used, in this browser, to lock and
    unlock your data. The only things stored unencrypted are the theme and reduced motion (the page needs them before it
    draws) and, with a passcode, how many wrong tries were made. None of it says anything about you or your games.
  </p>
  <p>
    Your browser keeps its own history of pages you've visited. PitMaster keeps game names out of it: a game's tab is
    just called Cash Game or Tournament. A TV's address does hold its code, so the TV can pick the game back up after a
    reload.
  </p>
  <p>
    The browser also keeps a copy of PitMaster's own files (the app itself, its icons and the pages' layouts) so the
    site opens without a connection. They're the same for everyone and hold none of your games or settings.
  </p>
  <p>
    Without a passcode, that keeps your games unreadable to anything that looks at the saved data without using the key,
    like someone browsing the site's storage in developer tools. It doesn't stop anyone who can use this browser: they
    can open PitMaster and see your games. And since the browser keeps the key on the same device, anyone who copies the
    whole browser profile gets the key along with the data. Protect the device and your account on it the way you would
    anything else. If a page isn't on a secure (https) connection, browsers won't encrypt, so PitMaster saves nothing at
    all there rather than saving it unencrypted.
  </p>
  <p>
    A passcode closes that gap (<a href="/settings#lock">Settings, Passcode Lock</a>). The key is then kept locked by a
    key made from the passcode (PBKDF2 with 600,000 rounds), so nothing saved can be opened without it, even by someone
    using this browser or copying its files. A short passcode can still be guessed by someone who has a copy, so longer
    is better. PitMaster locks itself after the time you choose with no input, and every tab locks with it. TV screens
    keep showing the game they were given, can't change anything, and never hold the key. We never see the passcode and
    can't recover a lost one: without it, the only way forward is deleting everything saved in the browser.
  </p>
  <p>
    Your data stays until you delete it (<a href="/settings#data">Settings, Export &amp; Import</a>, then Delete
    Everything), clear this site's data in your browser, or close a private window. Clearing the site's data deletes the
    key too, and without it nothing saved here can be read again, by you or by anyone. Every browser and device keeps
    its own separate copy, which is why exports exist.
  </p>

  <h2>Export Files</h2>
  <p>
    An export is made inside your browser and saved wherever you choose. It never passes through us. It holds everything
    listed above, players' names and pay links included.
  </p>
  <p>
    You can lock a full export with a password of at least 8 characters. It's then encrypted with AES-256-GCM under a
    key made from the password (PBKDF2 with 600,000 rounds), and only the file's type and date can be read without it.
    The longer the password, the harder it is to guess. We never see the password and
    can't recover a lost one. A file without a password, like a single game moved to another device, can be read by
    anyone who has it, and so can a spreadsheet or recap you download or copy. Keep them somewhere you trust and share
    them only with people who should see them.
  </p>

  <h2 id="tv">TV Codes</h2>
  <p>A TV window on the same computer gets the game straight from the dealer screen. Nothing leaves your device.</p>
  <p>When you press Go Live to show a game on another device:</p>
  <ul>
    <li>Your browser makes an eight-character code, and from it two things: an ID for our server to file the game under, and a key that locks it. Both come from a slow, one-way hash of the code (PBKDF2), and the code itself is never sent to us.</li>
    <li>Each time the game changes, your browser encrypts a copy with that key (AES-256-GCM) and sends it. The copy has the game and its display settings (like the currency, the clock format and the TV's volume), but not the game log, your other games, chip sets, templates or pay links.</li>
    <li>Our server stores the locked copy, the ID and a one-way hash (SHA-256) of a separate write key that only your browser holds, so only you can change or delete it. It has no way to unlock the copy.</li>
    <li>A screen given the code makes the same ID and key, fetches the copy and unlocks it. TV links carry the code after a “#”, a part of the address browsers never send to a server.</li>
    <li>The copy is deleted as soon as you press Stop Sharing or delete the game, or automatically two days after its last update. After Stop Sharing, a blank record with no game in it keeps the code from being reused until those two days are up.</li>
  </ul>
  <p>
    Anyone who has the code, or guesses it, can see the game while it's shared, so leave out anything you wouldn't show
    the room.
  </p>

  <h2>How It's Protected</h2>
  <ul>
    <li>The site and the TV code server are served over encrypted connections (HTTPS), and tell browsers never to use anything less.</li>
    <li>The site loads no third-party code: no ads, analytics, trackers or outside fonts. A strict content security policy stops the page from running any other scripts or talking to any server but ours.</li>
    <li>Your data is encrypted on your device, on our server and in password-locked exports, as described above.</li>
    <li>To slow down anyone trying to guess TV codes, the TV code server counts each IP address's requests for a minute at a time. The counts are kept only in memory and are never stored or logged.</li>
    <li>Files you import are checked before anything is saved, and one that doesn't look exactly like a PitMaster export is turned away whole.</li>
  </ul>
  <p>
    No system is perfectly secure, and PitMaster is a side project, not an audited security product. Don't put anything
    in it you couldn't stand to lose or to have seen.
  </p>

  <h2>Our Host</h2>
  <p>
    The site and the TV code server run on Cloudflare. To deliver pages and block attacks, Cloudflare handles technical
    details of each request, such as IP addresses and browser type, under
    <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener">its own privacy policy</a>. We
    don't add analytics, ads or tracking cookies, we don't log what you do, and we don't sell or share anything about you.
  </p>

  <h2>Other Services</h2>
  <ul>
    <li>Pay links open Venmo, Cash App or PayPal with an amount and the game's name filled in. What happens there is between you and them.</li>
    <li>The announcer uses your device's text-to-speech. Some browsers' online voices send the text to the browser's maker to be spoken.</li>
    <li>Links to other sites follow those sites' own policies.</li>
  </ul>

  <h2>Your Choices</h2>
  <ul>
    <li>Delete everything at any time from <a href="/settings#data">Settings</a>, or by clearing this site's data in your browser.</li>
    <li>Stop sharing a TV code at any time, and the copy on our server is deleted right away.</li>
    <li>Because we hold nothing that identifies you, there's nothing for us to look up, correct, hand over or delete on request. Everything is already in your hands.</li>
  </ul>

  <h2>Children</h2>
  <p>PitMaster is meant for adults. It isn't for children, and we don't knowingly collect information from anyone, of any age.</p>

  <h2>Changes</h2>
  <p>If this policy changes, the new version goes here and the date at the top changes with it.</p>

  <h2>Contact</h2>
  <p>Questions about privacy? Reach Wyzie LLC at <a href="https://wyzie.io/contact" target="_blank" rel="noopener">wyzie.io/contact</a>.</p>
</DocPage>
