# QR Paper Ballot Election – Verification App

This application allows voters to securely and anonymously verify that their vote was saved correctly.

The application consists of a simple **Express.js backend** and a **React frontend**.


## Server

The server's roles are:
- to give current election data to the client
- to allow the client to download a _single_ encrypted vote instead of having to load a potentially large number of votes. 

All encrypted votes are stored in a **public** gist and are **not secret**.

## Client

The client serves as a UI for end-users, voters who'd like to verify their votes.

#### Vote verification procedure

We designed a custom procedure for vote verification that makes the process anonymous and secure by neither sharing an unencrypted vote between client and server, nor compromising private keys secrecy.

_The **principle idea** is that by using deterministic versions of public key ciphers (RSA) during actual vote construction in the core system, we can later repeat the encryption process of the vote for all candidates and compare the results with the encrypted vote produced by the system. When one of the newly-produced encrypted votes is identical to the one produced by the system, we deduce that the actual encrypted vote produced by the system stores the same candidate, and we show this candidate to the user._

We know that deterministic cryptography has serious flaws and can be broken by bruteforce  (such as an unsalted password hash). That is why we use **random unqie secret salt** when encrypting each vote.

> For detailed technical documentation on the encryption procedure, check out the _Verifiable voting protocol_.
