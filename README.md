# Mashup Twitter Bot

A [node.js](http://nodejs.org) bot that takes multiple twitter accounts and tweets by mashing their tweets together!

## Status

I burned out on this because I wasn't crazy about the quality of the markov generator output and didn't feel like writing my own to replace it. Also the person who wanted this bot doesn't need it anymore. This was mostly an excuse to explore [node.js](http://nodejs.org) and it was effective; I've decided I'm not a fan.

However it does scan the list of twitter accounts given to it and generates an input file for the markov generator. It will then generate new tweets until you terminate the bot, though it will not post them. So feel free to to take this and do something cool with it! It's like 80% there and maybe I'll finish it someday.

## Setup

In order to run the bot you need to add your account credentials (if you don't know what that means go read the [twit](https://github.com/ttezel/twit) readme) and the list of twitter accounts to mashup.

#### Credentials

Update the **config/credentials.json** file with the relevant details. The format is self-explanatory.

#### Users

Add the twitter user accounts to mashup in **data/users.json**. The format is an array of accounts that is either the account name as a string or an object with a name property and a strip property describing a regular expression. The strip property is useful if you want to remove common text in that account's tweets that would add noise to the markov generator (e.g. the account always prefixes its tweets with a phrase). By default the mashup bot also strips urls out of tweets before adding them to the markov input file.

Example:

```json
[
    "TechCrunch",
    "ActuallyNPH",
    {
        "name": "PicardTips",
        "strip": "Picard \\w+ tip: "
    }
]
```
