import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabaseClient'
import ShareCard from './components/ShareCard'
import Settings from './components/Settings'
import WeaponTool from './components/WeaponTool'
import WeaponTool from './components/WeaponTool'

// C palette defined dynamically inside component (light/dark mode);

const WEAPONS = [
  { id:1, icon:"⚔️", tag:"FOUNDATIONS", title:"The Reality of the Battle", subtitle:"You Are at War Whether You Know It or Not", color:"red",
    scriptures:[
      {ref:"Ephesians 6:10–12 (ESV)",text:"Be strong in the Lord and in the strength of his might. Put on the whole armor of God, that you may be able to stand against the schemes of the devil. For we do not wrestle against flesh and blood, but against the rulers, against the authorities, against the cosmic powers over this present darkness, against the spiritual forces of evil in the heavenly places."},
      {ref:"1 Peter 5:8 (NKJV)",text:"Be sober, be vigilant; because your adversary the devil walks about like a roaring lion, seeking whom he may devour."},
      {ref:"John 10:10 (NIV)",text:"The thief comes only to steal and kill and destroy; I have come that they may have life, and have it to the full."},
    ],
    teaching:"Most believers know the Bible, attend church, and pray — yet live in consistent defeat. The reason is simple: they are fighting a war they do not acknowledge. Paul does not suggest that spiritual opposition exists; he declares it plainly. You are not wrestling against difficult people, hard circumstances, or bad luck. Behind every assault on your peace, purity, purpose, and relationships is an organized, intentional spiritual enemy.\n\nThe Greek word translated 'schemes' (methodeia) is the root of our word method. The enemy has a method — systematic, targeted, and personal. He studies your history, your weaknesses, and your calling. His goal is not merely to annoy you but to destroy you.\n\nBut Paul frames this in victory, not fear. 'Be strong in the Lord' — the strength is not yours to manufacture. The battle is real, but the outcome is already decided. Jesus declared 'It is finished' from the cross, stripping the enemy of his ultimate power. What remains is the enforcing of a victory already won.",
    tactics:["Spiritual blindness — keeping believers unaware a battle exists so they never fight back","Normalization — making sinful patterns feel like personality traits rather than strongholds","Isolation — cutting you off from community where covering and accountability exist","Accusation — reminding you of past failures to paralyze present obedience"],
    declaration:"I am not ignorant of the enemy's devices. I acknowledge the spiritual battle and take my position in Christ. I am strong — not in myself — but in the Lord and in the power of His might. The victory is already won. I enforce it today.",
    prayer:"Father, open my eyes to the spiritual reality around me. Remove complacency and spiritual blindness from my life. I acknowledge that I have an enemy with a method — and I choose today to stop living as a civilian. Train my hands for war and my fingers for battle. I stand in the finished work of Jesus. In His name, amen.",
    challenge:"Identify one area of your life where you have blamed circumstances or people rather than recognizing spiritual opposition. Write it down and pray over it specifically today.",
    fastingNote:null,
  },
  { id:2, icon:"🛡️", tag:"ARMOR", title:"The Full Armor of God", subtitle:"Dressed for Battle Every Single Day", color:"gold",
    scriptures:[
      {ref:"Ephesians 6:13–17 (ESV)",text:"Therefore take up the whole armor of God, that you may be able to withstand in the evil day, and having done all, to stand firm. Stand therefore, having fastened on the belt of truth, and having put on the breastplate of righteousness, and, as shoes for your feet, having put on the readiness given by the gospel of peace. In all circumstances take up the shield of faith, with which you can extinguish all the flaming darts of the evil one; and take the helmet of salvation, and the sword of the Spirit, which is the word of God."},
      {ref:"Romans 13:12 (NIV)",text:"The night is nearly over; the day is almost here. So let us put aside the deeds of darkness and put on the armor of light."},
    ],
    teaching:"Paul describes six pieces of armor — and every one is deliberately chosen.\n\nThe Belt of Truth holds everything together. Without integrity and God's Word as your foundation, the rest of the armor falls apart. Deception is the enemy's native language — truth is your first defense.\n\nThe Breastplate of Righteousness guards the heart — both the imputed righteousness of Christ (positional) and the practiced righteousness of obedience (practical). An unguarded heart is an open door.\n\nThe Gospel of Peace as shoes speaks of readiness and stability. Peace is not passive — it is the ground you stand on.\n\nThe Shield of Faith extinguishes all the flaming darts of the enemy. Doubt, fear, accusation, temptation — all quenched by active faith in God's promises.\n\nThe Helmet of Salvation protects the mind. It is not only a past event — it is a present reality that guards how you think about yourself, your future, and God.\n\nThe Sword of the Spirit is the only offensive weapon listed — the Word of God spoken with authority. Jesus used it three times against Satan in the wilderness. It is not enough to know Scripture — it must be wielded.",
    tactics:["Tempting you to remove specific pieces — living in truth but not righteousness","Making armor-wearing feel religious or unnecessary in 'safe' seasons","Attacking the mind specifically — knowing an unprotected mind is a vulnerable one","Neutralizing the sword by keeping believers Biblically illiterate or silent"],
    declaration:"I put on the full armor of God today. I fasten the belt of truth. I wear the breastplate of righteousness. My feet are ready with the gospel of peace. I raise the shield of faith. I place the helmet of salvation on my mind. I take up the sword of the Spirit. I am dressed for battle and I will not be moved.",
    prayer:"Father, I put on Your armor deliberately — piece by piece. Protect my heart with righteousness, my mind with salvation, my feet with peace. Let my faith extinguish every lie, fear, and accusation the enemy fires. Sharpen my sword. Let Your Word be alive and active in my mouth today. Amen.",
    challenge:"Pray on each piece of armor by name every morning this week. As you name each piece, ask God to make it real in one specific area of your life.",
    fastingNote:null,
  },
  { id:3, icon:"🏰", tag:"FREEDOM", title:"Breaking Strongholds", subtitle:"Tearing Down What the Enemy Has Built", color:"red",
    scriptures:[
      {ref:"2 Corinthians 10:3–5 (NKJV)",text:"For though we walk in the flesh, we do not war according to the flesh. For the weapons of our warfare are not carnal but mighty in God for pulling down strongholds, casting down arguments and every high thing that exalts itself against the knowledge of God, bringing every thought into captivity to the obedience of Christ."},
      {ref:"Isaiah 61:1 (NIV)",text:"The Spirit of the Sovereign Lord is on me, because the Lord has anointed me to proclaim good news to the poor. He has sent me to bind up the brokenhearted, to proclaim freedom for the captives and release from darkness for the prisoners."},
      {ref:"Galatians 5:1 (ESV)",text:"For freedom Christ has set us free; stand firm therefore, and do not submit again to a yoke of slavery."},
    ],
    teaching:"A stronghold is a fortified mindset — a pattern of thinking so entrenched it feels like truth. Paul describes strongholds as 'arguments and every high thing that exalts itself against the knowledge of God.' A stronghold is any belief system, thought pattern, or mental framework that contradicts what God says is true.\n\nStrongholds are built brick by brick — through repeated agreement with lies, trauma that goes unhealed, sin patterns that become habitual, and words spoken over us that we received as identity. Some strongholds are quiet: the persistent belief that you are not enough, that God is distant, that your past disqualifies you, that change is impossible.\n\nThe weapons that pull them down are 'mighty in God' — not willpower alone, not therapy alone, not time. They are weapons of the Spirit: the Word of God declared, persistent prayer, repentance that closes doors, and the community of believers who speak truth.\n\nEvery stronghold has a foundation stone — the original agreement or lie that allowed it to be built. Find the lie. Replace it with God's truth. Repeat the replacement until the new thought is stronger than the old one.",
    tactics:["Building strongholds slowly — small agreements with lies compound over years into walls","Disguising strongholds as personality ('I'm just an anxious person') to prevent confrontation","Creating shame around the stronghold to prevent confession and prayer with others","Using trauma as mortar — building lies onto real wounds to make them harder to challenge"],
    declaration:"No stronghold has authority over my life. I was bought with the blood of Jesus — every claim the enemy has made is canceled at the cross. I pull down every argument, every lie, every high thing that has exalted itself against what God says about me. I take my thoughts captive to Christ. I am free.",
    prayer:"Father, reveal the strongholds in my life — especially the ones I've normalized. Show me the foundational lie beneath each one. I renounce every agreement I have made with the enemy and break the power of those lies in Jesus' name. Replace them with Your Word. Freedom is my inheritance and I receive it today. Amen.",
    challenge:"Write down one stronghold you're aware of. Find one Scripture that directly contradicts the lie behind it. Declare that verse aloud every morning for seven days.",
    fastingNote:"Fasting accelerates stronghold-breaking. A 1–3 day fast targeting a stubborn stronghold, combined with prayer and Scripture declaration, creates concentrated spiritual pressure against entrenched patterns.",
  },
  { id:4, icon:"🔍", tag:"INTELLIGENCE", title:"Know Your Enemy", subtitle:"Understanding Satan's Character, Methods, and Limits", color:"steel",
    scriptures:[
      {ref:"John 8:44 (ESV)",text:"He was a murderer from the beginning, and does not stand in the truth, because there is no truth in him. When he lies, he speaks out of his own character, for he is a liar and the father of lies."},
      {ref:"2 Corinthians 2:11 (NKJV)",text:"Lest Satan should take advantage of us; for we are not ignorant of his devices."},
      {ref:"Colossians 2:15 (NIV)",text:"And having disarmed the powers and authorities, he made a public spectacle of them, triumphing over them by the cross."},
    ],
    teaching:"Effective warfare requires accurate intelligence. Many believers either overestimate the enemy — living in fear — or underestimate him, living in ignorance. Neither extreme serves the warrior.\n\nSatan's character is defined clearly: he is a liar (John 8:44), a thief (John 10:10), an accuser (Rev 12:10), a deceiver (Rev 12:9), and a destroyer. He has no creative power — he can only corrupt what God has made. He cannot read your mind; he observes your behavior. He is not omnipresent like God.\n\nHis greatest weapon is not power — it is deception. He convinced a third of the angels to follow him. He convinced Eve that God was withholding something good. His method is always the same: get you to question God's goodness, God's Word, or your identity in Christ.\n\nBut here is what must anchor your warfare: at the cross, Jesus disarmed the principalities and powers and made a public spectacle of them (Col 2:15). Satan is a defeated enemy fighting from a position of loss. Your role is not to defeat him — that is done. Your role is to enforce the victory.",
    tactics:["Lying about his own power — appearing stronger than he is to intimidate believers into passivity","Mimicking — counterfeiting spiritual experiences to confuse discernment","Using real people as messengers of his accusations and discouragement","Attacking at points of transition — calling, promotion, healing, or breakthrough"],
    declaration:"I am not ignorant of the enemy's devices. I know who he is, what he does, and what Christ has already done to him. Satan is disarmed. His authority was stripped at Calvary. I do not fear him. I walk in the authority of the risen Christ who has already won.",
    prayer:"Father, give me accurate spiritual intelligence. Let me see the enemy clearly — neither amplified by fear nor ignored by complacency. Thank You that Jesus publicly disarmed every power at the cross. Sharpen my discernment so I recognize the enemy's methods before I fall into them. In Jesus' name, amen.",
    challenge:"Study the three temptations of Jesus in Matthew 4:1–11. Notice the pattern: identity, provision, authority. Where is the enemy using those same three attacks in your life right now?",
    fastingNote:null,
  },
  { id:5, icon:"🔥", tag:"FASTING", title:"Fasting as a Weapon", subtitle:"The Discipline That Shifts the Spiritual Atmosphere", color:"red",
    scriptures:[
      {ref:"Isaiah 58:6 (NKJV)",text:"Is this not the fast that I have chosen: to loose the bonds of wickedness, to undo the heavy burdens, to let the oppressed go free, and that you break every yoke?"},
      {ref:"Matthew 17:21 (NKJV)",text:"However, this kind does not go out except by prayer and fasting."},
      {ref:"Joel 2:12 (ESV)",text:"Yet even now, declares the Lord, return to me with all your heart, with fasting, with weeping, and with mourning."},
    ],
    teaching:"Fasting is one of the most misunderstood and underused weapons in the believer's arsenal. It is not a hunger strike to get God's attention — God is always attentive. It is not penance — Jesus paid that price completely. Fasting is the deliberate denial of the flesh to heighten spiritual sensitivity and create conditions in which certain breakthroughs become accessible.\n\nJesus said of a particularly resistant demonic spirit: 'This kind does not go out except by prayer and fasting.' He was not teaching that fasting earns deliverance — He was revealing that some spiritual territory requires a level of focus and surrender that fasting produces. Fasting is concentrated spiritual pressure.\n\nIsaiah 58:6 reveals what God-ordained fasting accomplishes: it looses bonds of wickedness, undoes heavy burdens, frees the oppressed, and breaks yokes. These are warfare outcomes — specific, tangible, powerful.\n\nTypes of biblical fasting: the full fast (water only), the partial fast (Daniel's fast — no meat or wine), the intermittent fast (a daily window of prayer and abstinence). The duration matters less than the intention. A one-day focused fast with clear purpose is more powerful than a week of vague hunger.",
    tactics:["Making fasting feel extreme or unnecessary — keeping believers from this weapon entirely","Introducing pride — turning fasting into performance rather than warfare","Breaking fasts through distraction, busyness, or small compromises","Replacing genuine fasting with social media fasts that lack the spiritual discipline of food fasting"],
    declaration:"I take up fasting as a weapon of warfare. I deny my flesh its comfort to sharpen my spirit. Every yoke the enemy has placed on my life, my family, and those I intercede for — I break it through prayer and fasting. This kind comes out. The atmosphere shifts when I fast with faith and intention.",
    prayer:"Father, teach me to fast in a way that moves heaven. Forgive me for treating my body's comfort as more important than spiritual breakthrough. As I fast, make me sensitive to Your Spirit. Let every bond be loosed, every burden lifted, every oppression broken. I fast not to earn Your favor — I have it. I fast to focus, to surrender, and to press through. Amen.",
    challenge:"Choose one day this week to fast one or all meals for a specific breakthrough. Write down exactly what you are believing God for. Spend that time in focused prayer and Scripture.",
    fastingNote:"This is the fasting weapon — the most concentrated breakthrough tool available to the believer outside of prayer itself.",
  },
  { id:6, icon:"📢", tag:"DECLARATIONS", title:"The Power of Declaration", subtitle:"What You Speak Has Spiritual Weight", color:"gold",
    scriptures:[
      {ref:"Revelation 12:11 (NKJV)",text:"And they overcame him by the blood of the Lamb and by the word of their testimony, and they did not love their lives to the death."},
      {ref:"Proverbs 18:21 (NKJV)",text:"Death and life are in the power of the tongue, and those who love it will eat its fruit."},
      {ref:"Romans 10:10 (ESV)",text:"For with the heart one believes and is justified, and with the mouth one confesses and is saved."},
    ],
    teaching:"One of the most overlooked weapons in spiritual warfare is the spoken word. Revelation 12:11 tells us that the overcomers defeated the enemy 'by the blood of the Lamb and by the word of their testimony.' Two weapons: the blood of Jesus (what He did) and the word of testimony (what we say about what He did).\n\nProverbs declares that death and life are in the power of the tongue — this is not positive thinking. It is the recognition that spoken words carry spiritual weight. God created the universe by speaking. Jesus spoke to storms, to sickness, to demons — and they obeyed.\n\nDeclarations are not wishing or hoping out loud. They are the proclamation of what is already true in the spirit realm, enforced into the natural realm. When you declare 'I am healed by the stripes of Jesus,' you are not trying to create a reality — you are enforcing one the cross already established.\n\nThe enemy hates declarations because they remind him of his defeat. He prefers believers who think their faith silently. When you open your mouth and speak the Word over your life, your family, your circumstances, you are deploying the sword of the Spirit.",
    tactics:["Making believers feel foolish for speaking Scripture aloud — calling it performance","Filling the mouth with complaints, fears, and agreement with negative circumstances","Using your own words against you — knowing that what you declare you reinforce","Keeping believers silent in warfare — passive consumers of truth rather than active declarers"],
    declaration:"I overcome by the blood of the Lamb and the word of my testimony. I will not be silent. I declare what God says over my life — not what I feel, not what I see, not what the enemy whispers. Death and life are in the power of the tongue and I choose life. My words are weapons and I wield them with intention.",
    prayer:"Father, put a watch over my mouth. Let the words I speak agree with Your Word and not with fear, doubt, or the enemy's narrative. Teach me to be a warrior who speaks — who declares, who decrees, who testifies. Let my testimony be a weapon. In Jesus' name, amen.",
    challenge:"Write five personal declarations based on Scripture — areas where you need to override what you feel with what God says. Speak them aloud every morning for two weeks.",
    fastingNote:null,
  },
  { id:7, icon:"🧠", tag:"MIND", title:"Warfare Over the Mind", subtitle:"The Battlefield Is Between Your Ears", color:"steel",
    scriptures:[
      {ref:"2 Corinthians 10:5 (NKJV)",text:"Casting down arguments and every high thing that exalts itself against the knowledge of God, bringing every thought into captivity to the obedience of Christ."},
      {ref:"Romans 12:2 (ESV)",text:"Do not be conformed to this world, but be transformed by the renewal of your mind, that by testing you may discern what is the will of God, what is good and acceptable and perfect."},
      {ref:"Philippians 4:8 (NIV)",text:"Finally, brothers and sisters, whatever is true, whatever is noble, whatever is right, whatever is pure, whatever is lovely, whatever is admirable — if anything is excellent or praiseworthy — think about such things."},
    ],
    teaching:"Satan's primary battlefield is the mind. He cannot possess a Spirit-filled believer — but he can suggest. And a suggestion entertained long enough becomes a thought. A thought repeated becomes a belief. A belief acted upon becomes a stronghold. Everything the enemy builds begins with a thought he plants.\n\nPaul instructs believers to take 'every thought captive to the obedience of Christ.' The word captive is a military term — it implies force and decisive action. When a thought arrives that contradicts what God says, you do not analyze it, sympathize with it, or entertain it. You capture it. You interrogate it against Scripture. If it doesn't align, you reject it.\n\nThe renewing of the mind (Romans 12:2) is not passive. It is the active, repeated replacement of old patterns with God's Word. Neuroscience confirms what Paul declared: the brain's neural pathways are formed by repeated thought. Every time you rehearse a worry, you deepen that pathway. Every time you replace it with truth, you build a new one.\n\nWarfare over the mind requires two disciplines: taking thoughts captive (defensive) and filling the mind with God's Word (offensive). Both are necessary.",
    tactics:["Intrusive thoughts — planting thoughts designed to produce guilt, shame, or fear","Rumination — getting you to replay negative experiences, failures, or fears on loop","Comparison — using others' success or your perceived failure to breed discontent","Confusion — overwhelming the mind with noise so God's voice becomes hard to hear"],
    declaration:"My mind belongs to Christ. I capture every thought that contradicts what God says and I refuse it entry. My mind is being renewed — old patterns are broken, new ones built on truth. I think on what is true, noble, right, pure, lovely, and admirable. The enemy does not have access to my thought life.",
    prayer:"Father, I surrender my mind to You. Reveal every pattern of thinking that has given the enemy a foothold. Teach me to recognize his suggestions before I accept them as my own. Renew my mind with Your Word until it becomes my natural language. Holy Spirit, guard my thought life and bring me quickly back to truth when I drift. In Jesus' name, amen.",
    challenge:"For three days, keep a thought journal. Every time you notice a recurring negative, fearful, or self-condemning thought, write it down. Then write the Scripture that directly contradicts it and declare it aloud.",
    fastingNote:"Fasting significantly reduces the noise of fleshly patterns and heightens mental clarity in the Spirit. Many believers report their first sustained fast producing unusual clarity and peace of mind.",
  },
  { id:8, icon:"🦁", tag:"FEAR", title:"Fear — The Enemy's Most Used Weapon", subtitle:"Perfect Love Casts Out What the Enemy Most Deploys", color:"red",
    scriptures:[
      {ref:"2 Timothy 1:7 (NKJV)",text:"For God has not given us a spirit of fear, but of power and of love and of a sound mind."},
      {ref:"1 John 4:18 (ESV)",text:"There is no fear in love, but perfect love casts out fear. For fear has to do with punishment, and whoever fears has not been perfected in love."},
      {ref:"Psalm 27:1 (NKJV)",text:"The Lord is my light and my salvation; whom shall I fear? The Lord is the strength of my life; of whom shall I be afraid?"},
    ],
    teaching:"Fear is the enemy's most widely deployed weapon because it works on almost everyone. It doesn't require sin — it only requires a moment of taking your eyes off God and fixing them on what could go wrong.\n\nPaul's declaration is surgical: 'God has not given us a spirit of fear.' The word spirit (pneuma) indicates this is more than an emotion — it is a spiritual entity. Fear, in its persistent and paralyzing form, has a source, and that source is not God. God's Spirit produces power (dynamis — explosive ability), love, and a sound mind (sophronismos — self-discipline and clarity).\n\nJohn reveals the antidote: 'perfect love casts out fear.' Maturity in the love of God — knowing deeply that He is good, that He is for you, that nothing can separate you from His love — systematically dismantles fear. Fear cannot survive in the presence of settled, experienced love.\n\nNote that fear also has a practical effect: it predicts the outcome before it arrives and then aligns your behavior with that prediction, often producing the very thing feared. The warrior refuses to accept fear's narrative.",
    tactics:["What-if scenarios — flooding the mind with worst-case possibilities to paralyze action","Health anxiety, financial fear, relational fear — attacking through areas of greatest value","Fear of failure used to prevent obedience to calling and purpose","Fear of man — concern for others' opinions used to silence witness and compromise conviction"],
    declaration:"God has not given me a spirit of fear. Fear is not my inheritance and I refuse it. I have power — the same power that raised Christ from the dead. I have love — the love of God that casts out every fear. I have a sound mind — clear, disciplined, and anchored in truth. The Lord is my light and my salvation. I will not be afraid.",
    prayer:"Father, I bring every fear to You by name. I refuse to carry what You never gave me. Perfect Your love in me until fear has no place to stand. Where I have agreed with fear, I renounce that agreement now. Replace it with faith rooted in who You are. I am not afraid — You are with me. In Jesus' name, amen.",
    challenge:"Name your top three fears specifically. For each one, find a Scripture promise that addresses it directly. Declare those Scriptures aloud over each fear every day this week.",
    fastingNote:null,
  },
  { id:9, icon:"🎵", tag:"WORSHIP", title:"Warfare Through Worship", subtitle:"When Praise Becomes a Battle Strategy", color:"gold",
    scriptures:[
      {ref:"2 Chronicles 20:21–22 (NKJV)",text:"And when he had consulted with the people, he appointed those who should sing to the Lord, and who should praise the beauty of His holiness, as they went out before the army. Now when they began to sing and to praise, the Lord set ambushes against the people of Ammon, Moab, and Mount Seir — and they were defeated."},
      {ref:"Acts 16:25–26 (ESV)",text:"About midnight Paul and Silas were praying and singing hymns to God, and suddenly there was a great earthquake, so that the foundations of the prison were shaken. And immediately all the doors were opened."},
      {ref:"Psalm 149:6 (NKJV)",text:"Let the high praises of God be in their mouth, and a two-edged sword in their hand."},
    ],
    teaching:"Jehoshaphat faced three armies simultaneously. He had no military strategy that could win. God's instruction was unconventional: put the worshippers at the front of the army. Before a single sword was drawn, God set ambushes against the enemy when His people began to sing.\n\nThis is not inspirational metaphor — this is warfare theology. Worship does several things simultaneously: it redirects your focus from the size of the enemy to the greatness of God; it creates an atmosphere hostile to demonic presence; it positions God as the warrior in the battle, not you; and it releases faith through declaration of who God is regardless of circumstances.\n\nPaul and Silas in prison at midnight — beaten, chained, in physical pain — chose to worship. The result was an earthquake that opened every door and broke every chain. Worship at midnight is the most powerful kind because it is not generated by favorable circumstances. It is generated by settled conviction about who God is.\n\nPsalm 149 explicitly describes high praise as having a two-edged sword in hand. Worship in the presence of spiritual warfare is not passive piety. It is aggressive, faith-filled declaration.",
    tactics:["Discouragement — making you feel too low to worship, cutting off the weapon entirely","Distraction during worship — keeping your mind busy so praise never becomes warfare","Making worship about feelings — turning it into an emotion to achieve rather than a declaration to make","Attacking at midnight — the hardest seasons specifically targeted to silence worship"],
    declaration:"My praise is a weapon. When the enemy surrounds me, I put worship at the front. I praise God in the midnight — when I don't feel it, when I can't see it, when everything says it's over. High praise is in my mouth and a two-edged sword is in my hand. God fights for those who worship Him.",
    prayer:"Father, teach me to worship as warfare. Remove the conditions I place on praise — that I must feel good, see progress, or understand what You're doing. Jehoshaphat's army won without fighting because they worshipped first. Make me that kind of warrior. I praise You now — not because everything is fine, but because You are. Amen.",
    challenge:"The next time you face a spiritual attack or heavy discouragement — before you analyze it or talk to anyone about it — spend ten minutes in worship first. Write down what happens.",
    fastingNote:"Combining fasting and worship creates one of the most concentrated spiritual environments possible. Acts 13:2 shows fasting and worship together as the context for divine commissioning and breakthrough.",
  },
  { id:10, icon:"🔗", tag:"FREEDOM", title:"Generational Strongholds", subtitle:"Breaking What Was Passed Down to You", color:"red",
    scriptures:[
      {ref:"Galatians 3:13 (ESV)",text:"Christ redeemed us from the curse of the law by becoming a curse for us — for it is written, 'Cursed is everyone who is hanged on a tree.'"},
      {ref:"Exodus 20:5 (NIV)",text:"I, the Lord your God, am a jealous God, punishing the children for the sin of the parents to the third and fourth generation of those who hate me."},
      {ref:"Psalm 103:17 (NKJV)",text:"But the mercy of the Lord is from everlasting to everlasting on those who fear Him, and His righteousness to children's children."},
    ],
    teaching:"Generational patterns are real — both spiritually and behaviorally. Exodus 20:5 describes the consequences of sin extending to the third and fourth generation. This is not God punishing children arbitrarily — it describes the spiritual and practical reality that patterns, agreements, and consequences established in one generation tend to perpetuate in the next unless broken.\n\nFamilies pass down more than genetics. They pass down habits, agreements with certain sins, fears, belief systems, trauma responses, and spiritual vulnerabilities. The child of an alcoholic who becomes an alcoholic is not simply repeating behavior — there may be a spiritual dimension requiring more than behavioral change to break.\n\nHere is the non-negotiable anchor: Galatians 3:13 declares that Christ redeemed us from every curse. Every generational pattern — addiction, poverty, abandonment, sexual sin, occult involvement — has been addressed at Calvary. The redemption is complete. The question is not whether it's been done, but whether we apply and enforce it.\n\nBreaking generational strongholds requires: identifying the specific pattern, repenting of personal participation, renouncing ancestral agreements, applying the blood of Jesus by declaration, and walking in sustained obedience that establishes new patterns.",
    tactics:["Normalizing the pattern — making it feel like 'just how our family is'","Shame — making the pattern too embarrassing to confess or bring to prayer","Hopelessness — convincing you that some things just don't change in your family","Confusion about spiritual inheritance — making believers think they can't break what was started before them"],
    declaration:"Christ redeemed me from every curse — generational, self-imposed, and spiritually assigned. I break every pattern of sin, bondage, and agreement that has operated in my family line. I close every door the enemy has used across generations. A new inheritance begins with me. What was passed down stops here.",
    prayer:"Father, I stand in the authority of the cross over every generational pattern in my family line. I repent for my own participation and for the patterns of my ancestors. I renounce every covenant, every agreement, every open door that has given the enemy access across generations. I apply the blood of Jesus to my bloodline. Let mercy be my children's inheritance. In Jesus' name, amen.",
    challenge:"Identify one pattern — spiritual, behavioral, or emotional — that has shown up across multiple generations of your family. Pray specifically over it. Write a declaration that it ends with your generation.",
    fastingNote:"Fasting for generational freedom is a biblical pattern. Daniel fasted for his nation's sin and received heavenly breakthrough (Daniel 9–10). Consider a fast specifically targeting what has operated across your family line.",
  },
  { id:11, icon:"⚡", tag:"DISCERNMENT", title:"Discerning the Enemy's Voice", subtitle:"Identifying Lies and Replacing Them With Truth", color:"steel",
    scriptures:[
      {ref:"John 8:44 (ESV)",text:"He was a murderer from the beginning, and does not stand in the truth, because there is no truth in him. When he lies, he speaks out of his own character, for he is a liar and the father of lies."},
      {ref:"John 10:27 (NKJV)",text:"My sheep hear My voice, and I know them, and they follow Me."},
      {ref:"Isaiah 30:21 (NIV)",text:"Whether you turn to the right or to the left, your ears will hear a voice behind you, saying, 'This is the way; walk in it.'"},
    ],
    teaching:"One of the most critical skills in spiritual warfare is voice discernment — the ability to recognize whose voice is speaking into your mind and heart. Three voices compete: God's voice, the enemy's voice, and your own flesh.\n\nGod's voice will always align with Scripture, lead toward life and obedience, produce peace even when calling to hard things, and affirm your identity as His child. It convicts without condemning, corrects without destroying, and calls forward without creating panic.\n\nThe enemy's voice is characterized by urgency and pressure (decide now), shame and accusation (you are what you've done), hopelessness (nothing will ever change), comparison, and identity attack (God can't use you). His voice exaggerates, isolates, and distorts.\n\nYour own flesh produces a third voice — comfort-seeking, self-justifying, and pleasure-driven. It is not always the enemy; sometimes it is simply your preferences dressed as conviction.\n\nThe way to sharpen discernment is consistent time in Scripture and prayer until God's voice becomes so familiar that counterfeits are obvious. A bank teller spots a fake not because they study counterfeits but because they handle the real thing constantly.",
    tactics:["Mimicking the Holy Spirit — producing false peace or false urgency that leads away from obedience","Timing — speaking loudest in moments of vulnerability, exhaustion, or isolation","Personalization — making accusations feel like personal conviction rather than enemy attack","Persistent repetition — repeating lies until they feel like your own thoughts"],
    declaration:"I know my Shepherd's voice and the voice of a stranger I will not follow. I refuse every lie the enemy speaks about my identity, my future, my calling, and my God. I test every voice against Scripture. What does not align with God's Word does not get access to my heart. My discernment grows sharper every day.",
    prayer:"Father, train my ear to hear Your voice clearly. Expose every counterfeit — every suggestion that sounds reasonable but contradicts Your Word. Where I have accepted lies as my own thoughts, reveal them and replace them with truth. I want to follow You — not my flesh, not the enemy's suggestions. Speak, Lord. Your servant is listening. Amen.",
    challenge:"Write down three things you believe about yourself that produce shame, limitation, or defeat. For each — trace its source. Is it from Scripture? From God's Spirit? Or from somewhere else? Replace each with a specific biblical truth.",
    fastingNote:null,
  },
  { id:12, icon:"👑", tag:"AUTHORITY", title:"Walking in Spiritual Authority", subtitle:"Enforcing the Victory Jesus Already Won", color:"gold",
    scriptures:[
      {ref:"Luke 10:19 (NKJV)",text:"Behold, I give you the authority to trample on serpents and scorpions, and over all the power of the enemy, and nothing shall by any means hurt you."},
      {ref:"James 4:7 (ESV)",text:"Submit yourselves therefore to God. Resist the devil, and he will flee from you."},
      {ref:"Ephesians 2:6 (NIV)",text:"And God raised us up with Christ and seated us with him in the heavenly realms in Christ Jesus."},
    ],
    teaching:"The believer's authority in Christ is one of the most neglected doctrines in modern Christianity — and one of the most transformative when understood and walked in. Jesus did not suggest that you have authority over the enemy. He declared it: 'I give you authority over all the power of the enemy.'\n\nEphesians 2:6 reveals your current position: seated with Christ in heavenly realms. This is not a future state — it is present reality. You are not fighting toward victory. You are fighting from victory. Your warfare posture is not a desperate upward struggle; it is a downward enforcement of what Christ accomplished.\n\nJames 4:7 gives the two-part formula: submit to God, then resist the devil. The order is not interchangeable. Authority flows from submission. A soldier does not have authority to act on behalf of a general he does not obey. The believer who walks in consistent surrender to God walks in increasing authority.\n\nThe word 'flee' in James 4:7 is pheugo — it means to run away in terror. The enemy does not stand his ground when properly resisted by a submitted, Spirit-filled believer. He flees. The question is not whether the enemy will flee. The question is whether you will actually resist him.",
    tactics:["Authority confusion — making believers think spiritual authority belongs only to pastors or 'special' Christians","Disconnection from submission — producing bold declaration without genuine surrender to God","Making the enemy seem immovable — discouraging resistance through apparent persistence","Reversing the order — resisting the devil before submitting to God, producing powerless warfare"],
    declaration:"I am seated with Christ in heavenly places. I fight from victory, not toward it. I submit fully to God — His Word, His Spirit, His authority over my life. And from that place of submission I resist the enemy with confidence. He must flee. That is not arrogance — that is Scripture. I walk in the authority of the risen Christ.",
    prayer:"Father, make the reality of my position in Christ more real than what I see and feel. I am seated with You — above every principality and power. I submit my will, my plans, my life to You completely. And from that place, I take my stand. I resist every scheme of the enemy in Jesus' name, knowing he must give way. Teach me to walk in authority every day — humbly, boldly, and consistently. Amen.",
    challenge:"Read Ephesians 1:15–23 slowly. Write in your own words what it means to be seated with Christ above every power. Then pray from that position — not asking God to defeat the enemy, but thanking Him that the enemy is already defeated.",
    fastingNote:"Fasting is one of the clearest expressions of submission to God. This posture is the foundation of spiritual authority. Many believers find fasting and warfare prayer together produce the most significant breakthroughs.",
  },
  { id:13, icon:"🙏", tag:"INTERCESSION", title:"The Weapon of Intercession", subtitle:"Praying Others Into Their Breakthrough", color:"gold",
    scriptures:[
      {ref:"Ezekiel 22:30 (NKJV)",text:"So I sought for a man among them who would make a wall, and stand in the gap before Me on behalf of the land, that I should not destroy it; but I found no one."},
      {ref:"1 Timothy 2:1–2 (ESV)",text:"First of all, then, I urge that supplications, prayers, intercessions, and thanksgivings be made for all people, for kings and all who are in high positions, that we may lead a peaceful and quiet life, godly and dignified in every way."},
      {ref:"Romans 8:26 (NIV)",text:"In the same way, the Spirit helps us in our weakness. We do not know what we ought to pray for, but the Spirit himself intercedes for us through wordless groans."},
    ],
    teaching:"Intercession is standing in the gap — positioning yourself between the enemy's assault and the person he is targeting. It is one of the most selfless and powerful forms of spiritual warfare because it requires you to carry a burden that is not primarily your own.\n\nGod searched for someone to stand in the gap in Ezekiel 22:30. The absence of intercessors is not a minor omission — it has consequences. Where there is no intercession, the enemy operates with less resistance. Where there are faithful intercessors, breakthroughs come that would not otherwise occur.\n\nThe Holy Spirit is the greatest intercessor. Romans 8:26 reveals that when we don't know how to pray, He takes over — interceding with groans that words cannot express. The Spirit-led intercessor is not operating alone; they are partnering with the Spirit of God who knows exactly what is needed.\n\nIntercession in warfare targets specific ground: principalities over regions, spiritual blindness over unsaved loved ones, assignments against specific people's destinies. Pray with precision, not generality.",
    tactics:["Weariness — making intercession feel fruitless when breakthrough isn't immediately visible","Distraction during prayer — preventing sustained focus that produces real spiritual pressure","Discouragement when those you intercede for don't immediately change","Creating a spirit of offense so intercessors quit praying for those who have hurt them"],
    declaration:"I am a gap-stander. I stand in the authority of Christ between the enemy's assault and those I love. My prayers move heaven and bind what the enemy has assigned. I do not pray in my own understanding — the Holy Spirit intercedes through me with perfect accuracy. The ground I cover in prayer is held.",
    prayer:"Father, make me an intercessor. Give me the grace to carry burdens that are not my own. Show me who to pray for, what to pray, and how to stand when the answer is delayed. Holy Spirit, intercede through me with precision and power. I stand in the gap for my family, my city, and those You have placed on my heart. What I bind on earth is bound in heaven. Amen.",
    challenge:"Choose one person to intercede for intentionally this week — someone facing spiritual attack, blindness, or bondage. Pray for them by name every day, specifically, and track what happens.",
    fastingNote:"Intercession combined with fasting is one of the most powerful forms of spiritual warfare. Daniel's 21-day fast moved heaven on behalf of his entire nation.",
  },
  { id:14, icon:"💎", tag:"PURITY", title:"Sexual Purity as Warfare", subtitle:"Closing the Door the Enemy Most Exploits", color:"red",
    scriptures:[
      {ref:"1 Corinthians 6:18–20 (ESV)",text:"Flee from sexual immorality. Every other sin a person commits is outside the body, but the sexually immoral person sins against his own body. Or do you not know that your body is a temple of the Holy Spirit within you, whom you have from God? You are not your own, for you were bought with a price. So glorify God in your body."},
      {ref:"Job 31:1 (NKJV)",text:"I have made a covenant with my eyes; why then should I look upon a young woman?"},
      {ref:"1 Thessalonians 4:3–4 (NIV)",text:"It is God's will that you should be sanctified: that you should avoid sexual immorality; that each of you should learn to control your own body in a way that is holy and honorable."},
    ],
    teaching:"Sexual sin is not simply a moral failure — it is one of the enemy's primary access points to a believer's spirit, soul, and body. Paul's instruction to 'flee' (pheugō — run in terror) sexual immorality uses the same word James uses to describe the enemy fleeing from a resisting believer. The posture toward sexual sin and the enemy is the same: run.\n\nThe enemy specifically targets sexual purity because sexual immorality sins against one's own body — the temple of the Holy Spirit. Every act of sexual immorality outside of God's covenant opens doors and creates attachments that affect the believer's spiritual clarity, authority, and intimacy with God.\n\nJob made a covenant with his eyes before the temptation arrived. This is the warfare posture: pre-commitment, boundaries established in advance, not negotiated in the moment of temptation.\n\nFreedom from sexual bondage is fully available through the cross. Repentance closes doors; renunciation of soul ties breaks attachments; the blood of Jesus covers and restores.",
    tactics:["Gradual desensitization — normalizing what was once unthinkable through repeated exposure","Isolation — creating shame that prevents accountability, which allows the cycle to continue","Counterfeit intimacy — offering the feeling of connection and pleasure without covenant commitment","Spiritual fog — using sexual sin to cloud the believer's discernment, prayer life, and sense of God's presence"],
    declaration:"My body is a temple of the Holy Spirit. I belong to God — bought with the blood of Jesus. I close every door that sexual sin has opened in my life. I renounce every soul tie formed outside of God's covenant. I walk in purity not as performance but as war — as the protection of my spiritual clarity, authority, and intimacy with God.",
    prayer:"Father, I bring every area of sexual sin and temptation before You with complete honesty. I repent of every act that has given the enemy access through my body. I renounce every soul tie formed outside of Your covenant and break it now in Jesus' name. Restore my clarity. Restore my spiritual sensitivity. Restore my intimacy with You. My body is Yours. Help me flee what I must flee and stand firm in purity by the power of Your Spirit. Amen.",
    challenge:"Identify the primary entry point of sexual temptation in your life and make a specific, concrete decision to close it this week — not when tempted, but now, in advance.",
    fastingNote:"Fasting is one of the most effective tools for breaking sexual strongholds. It disciplines the flesh at its most basic level — hunger — and trains it toward surrender rather than gratification.",
  },
  { id:15, icon:"🌿", tag:"ENDURANCE", title:"Finishing the Fight", subtitle:"The Warfare of Not Quitting", color:"steel",
    scriptures:[
      {ref:"2 Timothy 4:7 (NKJV)",text:"I have fought the good fight, I have finished the race, I have kept the faith."},
      {ref:"Hebrews 12:1–2 (ESV)",text:"Therefore, since we are surrounded by so great a cloud of witnesses, let us also lay aside every weight, and sin which clings so closely, and let us run with endurance the race that is set before us, looking to Jesus, the founder and perfecter of our faith."},
      {ref:"Galatians 6:9 (NIV)",text:"Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up."},
    ],
    teaching:"Paul wrote 2 Timothy 4:7 from death row — days before his execution. These are not the words of a man looking back on an easy life. They are the words of a man who endured imprisonment, beatings, shipwreck, rejection, and betrayal — and still finished well. The fight was good. The race was finished. The faith was kept.\n\nThe enemy's most effective long-game strategy is not dramatic defeat — it is slow erosion. Gradually wearing down the armor. Gradually silencing the declarations. Gradually making retreat feel reasonable. Most believers are not overcome in a single assault; they are worn out over time.\n\nHebrews 12 frames endurance in the context of a great cloud of witnesses. You do not run alone. And you run by looking to Jesus — the author and finisher of your faith.\n\nGalatians 6:9 contains a promise with a condition: the harvest comes at the proper time — if you do not give up. The harvest is real. The timing is God's. The condition is yours: do not give up.",
    tactics:["Weariness — making sustained obedience feel pointless when results are delayed","Comparison — using others' visible progress to make your faithful endurance seem slow","Discouragement after failure — using a single setback to suggest the entire journey is over","Comfort — making retreat feel like rest, and passivity feel like peace"],
    declaration:"I fight the good fight. I finish the race. I keep the faith. I will not quit — not when I'm tired, not when I fail, not when the harvest is delayed, not when I can't see the progress. The same power that raised Jesus from the dead is working in me. I run with endurance. I endure to the end. The fight is good and I am finishing it.",
    prayer:"Father, give me the grace to endure. Where I have grown weary, renew my strength. Where I have been tempted to quit, give me eyes to see the great cloud of witnesses cheering me on. Let me fix my eyes on Jesus — the author and finisher of my faith — and run the race set before me. I will finish well — not in my own strength, but in Yours. To the very end. In Jesus' name, amen.",
    challenge:"Identify one area where you have been tempted to give up or slow down in your spiritual life. Recommit to it this week with one concrete, measurable action. Ask someone to hold you accountable.",
    fastingNote:"A focused fast at a point of spiritual weariness has historically produced renewed clarity and fire. Don't fast when you feel strong — fast when you feel like quitting.",
  },
];

const TABS = [
  {id:"scripture",label:"📖 Scripture"},
  {id:"teaching",label:"📜 Teaching"},
  {id:"tactics",label:"🎯 Enemy Tactics"},
  {id:"declare",label:"⚔️ Declare"},
  {id:"journal",label:"✍️ Journal"},
  {id:"tool",label:"🛠️ Tool"},
];

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]

export default function ArmedAndAnchored({ session, profile }) {
  const [lightMode, setLightMode] = useState(() => {
    try { return localStorage.getItem('aa_lightmode') === 'true' } catch { return false }
  })
  const userId = session?.user?.id

  // ── STATE ──────────────────────────────────────────────────────────────
  const [entries, setEntries] = useState([])
  // Dynamic palette — switches with lightMode
  const C = lightMode ? {
    bg: "#F2EDE3", bgCard: "rgba(0,0,0,0.04)", mid: "#E8E0D0",
    red: "#9E2828", redL: "#C94848", redF: "rgba(158,40,40,0.1)", redB: "rgba(158,40,40,0.25)",
    gold: "#8B6A30", goldL: "#A07A38", goldF: "rgba(139,106,48,0.12)", goldB: "rgba(139,106,48,0.3)",
    steel: "#5A6878", steelF: "rgba(90,104,120,0.12)", steelB: "rgba(90,104,120,0.3)",
    cream: "#1A1209", text: "#3D2E1A", muted: "#7A6A5A", dim: "#B0A090",
    border: "rgba(0,0,0,0.08)", borderGold: "rgba(139,106,48,0.25)", borderRed: "rgba(158,40,40,0.2)",
    green: "#4A7A5A",
  } : {
    bg: "#070E17", bgCard: "rgba(255,255,255,0.025)", mid: "#0D1B2A",
    red: "#9E2828", redL: "#C94848", redF: "rgba(158,40,40,0.14)", redB: "rgba(158,40,40,0.32)",
    gold: "#B08A4E", goldL: "#D4A853", goldF: "rgba(176,138,78,0.11)", goldB: "rgba(176,138,78,0.28)",
    steel: "#6A8099", steelF: "rgba(106,128,153,0.12)", steelB: "rgba(106,128,153,0.3)",
    cream: "#EDE6D6", text: "#C8BEAA", muted: "#7C90A2", dim: "#4E6070",
    border: "rgba(255,255,255,0.06)", borderGold: "rgba(176,138,78,0.2)", borderRed: "rgba(158,40,40,0.3)",
    green: "#7C9284",
  }

  const [selected, setSelected] = useState(null)
  const [tab, setTab] = useState("scripture")
  const [declared, setDeclared] = useState({})
  const [day, setDay] = useState(-1)
  const [deployFlash, setDeployFlash] = useState({})
  const [shareFlash, setShareFlash] = useState(null)
  const [shareCard, setShareCard] = useState(null) // {weapon, type}
  const [saving, setSaving] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const weapon = selected ? WEAPONS.find(w => w.id === selected) : null

  // ── LOAD ENTRIES FROM SUPABASE ──────────────────────────────────────────
  useEffect(() => {
    if (!userId) return
    supabase
      .from('weapon_entries')
      .select('*')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (data) {
          setEntries(data)
          // Rebuild declared from entries
          const dec = {}
          data.filter(e => e.field_key === 'declared').forEach(e => { dec[e.weapon_id] = true })
          setDeclared(dec)
        }
      })
  }, [userId])

  // ── GET / SET ENTRY ─────────────────────────────────────────────────────
  const get = (fieldKey) => {
    const e = entries.find(e => e.weapon_id === selected && e.field_key === fieldKey)
    return e?.field_value || ''
  }

  const set = useCallback(async (fieldKey, value) => {
    if (!userId || !selected) return
    // Optimistic update
    setEntries(prev => {
      const idx = prev.findIndex(e => e.weapon_id === selected && e.field_key === fieldKey)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = { ...updated[idx], field_value: value }
        return updated
      }
      return [...prev, { user_id: userId, weapon_id: selected, field_key: fieldKey, field_value: value }]
    })
    // Persist to Supabase
    await supabase.from('weapon_entries').upsert({
      user_id: userId,
      weapon_id: selected,
      field_key: fieldKey,
      field_value: value,
    }, { onConflict: 'user_id,weapon_id,field_key' })
  }, [userId, selected])

  const getToolData = () => {
    const raw = get('tool_data')
    if (!raw) return {}
    try { return JSON.parse(raw) } catch { return {} }
  }

  const setToolData = (newData) => {
    set('tool_data', JSON.stringify(newData))
  }

  const markDeclared = async (id) => {
    const newDec = { ...declared, [id]: true }
    setDeclared(newDec)
    setDeployFlash(f => ({ ...f, [id]: true }))
    setTimeout(() => setDeployFlash(f => ({ ...f, [id]: false })), 2000)
    await supabase.from('weapon_entries').upsert({
      user_id: userId, weapon_id: id, field_key: 'declared', field_value: 'true'
    }, { onConflict: 'user_id,weapon_id,field_key' })
  }

  const goWk = (id) => { setSelected(id); setTab('scripture'); setDay(-1); window.scrollTo(0,0) }

  const shareText = async (text) => {
    if (navigator.share) {
      try { await navigator.share({ title: 'Armed & Anchored', text }) } catch {}
    } else {
      try { 
        await navigator.clipboard.writeText(text)
        setShareFlash('text')
        setTimeout(() => setShareFlash(null), 2000) 
      } catch {}
    }
  }

  const shareApp = async () => {
    const url = window.location.href
    const text = 'Armed & Anchored — Spiritual Warfare Training Journal. 15 weapons. Scripture, teaching, enemy tactics, declarations, and prayer for every battle.'
    if (navigator.share) {
      try { await navigator.share({ title: 'Armed & Anchored', text, url }) } catch {}
    } else {
      try { await navigator.clipboard.writeText(url); setShareFlash('app'); setTimeout(() => setShareFlash(null), 2000) } catch {}
    }
  }

  const shareWeapon = async (w) => {
    const text = `Armed & Anchored — ${w.icon} ${w.title}\n\n"${w.scriptures[0].text}"\n— ${w.scriptures[0].ref}\n\nDeclaration: ${w.declaration}`
    if (navigator.share) {
      try { await navigator.share({ title: `Armed & Anchored: ${w.title}`, text }) } catch {}
    } else {
      try { await navigator.clipboard.writeText(text); setShareFlash(w.id); setTimeout(() => setShareFlash(null), 2000) } catch {}
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const toggleLightMode = () => {
    const next = !lightMode
    setLightMode(next)
    try { localStorage.setItem('aa_lightmode', String(next)) } catch {}
  }

  const daysComplete = (id) => entries.filter(e => e.weapon_id === id && e.field_key.startsWith('tr_') && (e.field_value || '').trim()).length
  const completedCount = WEAPONS.filter(w => declared[w.id]).length

  const acc = (w) => w?.color === 'red' ? C.redL : w?.color === 'steel' ? C.steel : C.gold
  const accF = (w) => w?.color === 'red' ? C.redF : w?.color === 'steel' ? C.steelF : C.goldF
  const accB = (w) => w?.color === 'red' ? C.redB : w?.color === 'steel' ? C.steelB : C.goldB

  const INP = {
    width: '100%', background: 'rgba(255,255,255,0.03)',
    border: `1px solid ${C.borderGold}`, borderRadius: 14,
    color: C.cream, fontSize: 17, lineHeight: 1.9,
    padding: '14px 16px', fontFamily: "'EB Garamond',Georgia,serif",
    outline: 'none', resize: 'vertical', boxSizing: 'border-box',
  }

  const EmojDock = ({activeId}) => (
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:200,background:"rgba(7,14,23,0.97)",backdropFilter:"blur(20px)",borderTop:"1px solid rgba(158,40,40,0.28)",padding:"10px 6px 14px"}}>
      <div style={{fontSize:8,color:C.dim,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"'Cinzel',Georgia,serif",textAlign:"center",marginBottom:7}}>15 Weapons</div>
      <div style={{display:"flex",gap:3,justifyContent:"center",overflowX:"auto",padding:"0 2px",scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}}>
        {WEAPONS.map(w => {
          const done = declared[w.id];
          const active = w.id === activeId;
          return (
            <button key={w.id} onClick={()=>{setSelected(w.id);setTab("scripture");window.scrollTo(0,0);}} title={w.title}
              style={{background:active?"linear-gradient(145deg,rgba(158,40,40,0.4),rgba(158,40,40,0.18))":done?"rgba(158,40,40,0.12)":"rgba(255,255,255,0.04)",
                border:`1px solid ${active?"rgba(158,40,40,0.7)":done?"rgba(158,40,40,0.3)":"rgba(255,255,255,0.07)"}`,
                borderRadius:9,width:36,height:36,cursor:"pointer",fontSize:16,
                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                transition:"all .15s",
                boxShadow:active?"0 0 14px rgba(158,40,40,0.55)":"none",
                transform:active?"translateY(-4px) scale(1.12)":"none",
                position:"relative"}}>
              {w.icon}
              {done && !active && <span style={{position:"absolute",top:1,right:2,fontSize:6,color:C.redL,lineHeight:1}}>✦</span>}
            </button>
          );
        })}
      </div>
    </div>
  );



  // Inject fadeIn keyframe once
  if (typeof document !== 'undefined' && !document.getElementById('aa-fadein')) {
    const s = document.createElement('style')
    s.id = 'aa-fadein'
    s.textContent = '@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }'
    document.head.appendChild(s)
  }

  // Settings overlay
  if (showSettings) return (
    <Settings
      profile={profile}
      lightMode={lightMode}
      onToggleLightMode={toggleLightMode}
      onClose={() => setShowSettings(false)}
    />
  )

  if (!selected) return (
    <div style={{minHeight:"100vh",background:`radial-gradient(ellipse at 20% 0%, rgba(158,40,40,0.18) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(176,138,78,0.1) 0%, transparent 55%), ${C.bg}`,fontFamily:"'EB Garamond',Georgia,serif",color:C.text,paddingBottom:90,animation:"fadeIn 0.4s ease"}}>
      <div style={{borderBottom:`1px solid ${C.border}`,padding:"28px 24px 22px",textAlign:"center",background:"linear-gradient(180deg,rgba(158,40,40,0.07),transparent)"}}>
        <div style={{fontSize:11,color:C.red,letterSpacing:"0.22em",fontFamily:"'Cinzel',Georgia,serif",textTransform:"uppercase",marginBottom:10,opacity:0.9}}>Elora Radiance Co.</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:5}}>
          <span style={{fontSize:24,opacity:0.6,transform:"scaleX(-1)",display:"inline-block"}}>⚔️</span>
          <span style={{fontSize:34,fontWeight:700,color:C.cream,fontFamily:"'Cinzel',Georgia,serif",letterSpacing:"0.04em",lineHeight:1.1}}>Armed & Anchored</span>
          <span style={{fontSize:24,opacity:0.6,display:"inline-block"}}>⚔️</span>
        </div>
        <div style={{fontSize:12,color:C.muted,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:"'Cinzel',Georgia,serif",marginBottom:18}}>Spiritual Warfare Training Journal</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,flexWrap:"wrap",marginBottom:0}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:C.redF,border:`1px solid ${C.redB}`,borderRadius:20,padding:"4px 16px",fontSize:12,color:C.redL,fontFamily:"'Cinzel',Georgia,serif",letterSpacing:"0.06em"}}>
            ⚔️ {completedCount} / {WEAPONS.length} Weapons Deployed
          </div>
          <button onClick={shareApp} style={{background:C.goldF,border:`1px solid ${C.goldB}`,color:shareFlash==="home"?C.green:C.gold,borderRadius:20,padding:"5px 14px",cursor:"pointer",fontSize:11,fontFamily:"'Cinzel',Georgia,serif",letterSpacing:"0.07em",transition:"all .25s"}}>
            {shareFlash==="home" ? "✓ Copied" : "🔗 Share"}
          </button>
          <button onClick={()=>setShowSettings(true)} style={{background:C.bgCard,border:`1px solid ${C.border}`,color:C.muted,borderRadius:20,padding:"5px 12px",cursor:"pointer",fontSize:14,transition:"all .25s"}}>
            ⚙️
          </button>
        </div>
        {completedCount > 0 && (
          <div style={{height:2,background:C.border,borderRadius:2,maxWidth:300,margin:"12px auto 0",overflow:"hidden"}}>
            <div style={{height:"100%",background:`linear-gradient(90deg,${C.red},${C.redL})`,width:`${(completedCount/WEAPONS.length)*100}%`,transition:"width .5s ease"}}/>
          </div>
        )}
      </div>

      <div style={{padding:"18px 18px 0"}}>
        <div style={{background:`linear-gradient(135deg,rgba(158,40,40,0.1),rgba(176,138,78,0.06))`,border:`1px solid rgba(158,40,40,0.22)`,borderRadius:14,padding:"16px 20px",marginBottom:6}}>
          <p style={{fontSize:17,color:C.cream,fontStyle:"italic",lineHeight:1.8,margin:"0 0 8px"}}>"Put on the whole armor of God, that you may be able to stand against the schemes of the devil."</p>
          <div style={{fontSize:10,color:C.gold,fontFamily:"'Cinzel',Georgia,serif",letterSpacing:"0.1em",textTransform:"uppercase"}}>Ephesians 6:11 (ESV)</div>
        </div>
      </div>

      <div style={{padding:"14px 18px 40px"}}>
        <div style={{fontSize:9,color:C.muted,letterSpacing:"0.18em",textTransform:"uppercase",fontFamily:"'Cinzel',Georgia,serif",marginBottom:12}}>15 Weapons of the Believer</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:9}}>
          {WEAPONS.map(w => {
            const done = declared[w.id];
            return (
              <button key={w.id} onClick={()=>{setSelected(w.id);setTab("scripture");window.scrollTo(0,0);}} style={{background:done?`linear-gradient(145deg,rgba(158,40,40,0.12),rgba(158,40,40,0.04))`:`linear-gradient(145deg,rgba(255,255,255,0.028),rgba(255,255,255,0.01))`,border:`1px solid ${done?"rgba(158,40,40,0.35)":C.border}`,borderRadius:14,padding:"16px 18px",cursor:"pointer",textAlign:"left",transition:"all .2s",position:"relative"}}>
                {done && <div style={{position:"absolute",top:10,right:12,fontSize:10,color:C.redL,fontFamily:"'Cinzel',Georgia,serif",letterSpacing:"0.06em"}}>✦ Deployed</div>}
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <span style={{fontSize:22}}>{w.icon}</span>
                  <div style={{fontSize:9,color:acc(w),letterSpacing:"0.16em",textTransform:"uppercase",fontFamily:"'Cinzel',Georgia,serif"}}>{w.tag}</div>
                </div>
                <div style={{fontSize:15,fontWeight:600,color:C.cream,fontFamily:"'Cinzel',Georgia,serif",lineHeight:1.25,marginBottom:4}}>{w.title}</div>
                <div style={{fontSize:12,color:C.muted,fontStyle:"italic",lineHeight:1.4}}>{w.subtitle}</div>
              </button>
            );
          })}
        </div>
      </div>
    <EmojDock activeId={null}/>
    </div>
  );

  if (shareCard) {
    return (
      <>
        <ShareCard weapon={shareCard.weapon} initialType={shareCard.type} onClose={() => setShareCard(null)} />
        <div style={{filter:'blur(4px)',pointerEvents:'none',position:'fixed',inset:0,background:C.bg}}/>
      </>
    )
  }

  return (
    <div style={{minHeight:"100vh",background:`radial-gradient(ellipse at 50% 0%, ${accF(weapon).replace("0.1","0.2")} 0%, transparent 50%), ${C.bg}`,fontFamily:"'EB Garamond',Georgia,serif",color:C.text,paddingBottom:90}}>
      <div style={{position:"sticky",top:0,zIndex:100,background:"rgba(7,14,23,0.94)",backdropFilter:"blur(14px)",borderBottom:`1px solid ${C.border}`,padding:"11px 16px",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>{setSelected(null);window.scrollTo(0,0);}} style={{background:C.bgCard,border:`1px solid ${C.border}`,color:C.muted,width:34,height:34,borderRadius:8,cursor:"pointer",fontSize:17,flexShrink:0}}>‹</button>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:9,color:acc(weapon),letterSpacing:"0.16em",textTransform:"uppercase",fontFamily:"'Cinzel',Georgia,serif"}}>{weapon.tag}</div>
          <div style={{fontSize:14,color:C.cream,fontFamily:"'Cinzel',Georgia,serif",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{weapon.icon} {weapon.title}</div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
          {declared[weapon.id] && <span style={{fontSize:10,color:"#C94848",fontFamily:"'Cinzel',Georgia,serif",letterSpacing:"0.08em"}}>&#10022; Deployed</span>}
          <button onClick={()=>setShareCard({weapon,type:tab==="teaching"?"teaching":tab==="tactics"?"tactics":tab==="declare"?"declaration":"scripture"})} style={{background:"rgba(176,138,78,0.1)",border:"1px solid rgba(176,138,78,0.28)",color:"#B08A4E",borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:12,transition:"all .25s"}}>
            🖼
          </button>
        </div>
      </div>

      <div style={{padding:"22px 18px 0"}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:42,marginBottom:10}}>{weapon.icon}</div>
          <h1 style={{fontSize:22,fontWeight:700,color:C.cream,fontFamily:"'Cinzel',Georgia,serif",marginBottom:5,lineHeight:1.2}}>{weapon.title}</h1>
          <p style={{fontSize:13,color:C.muted,fontStyle:"italic"}}>{weapon.subtitle}</p>
        </div>
        <div style={{display:"flex",gap:4,flexWrap:"nowrap",overflowX:"auto",paddingBottom:14,scrollbarWidth:"none"}}>
          {TABS.map(t => (
            <button key={t.id} onClick={()=>{setTab(t.id);window.scrollTo(0,0);}} style={{background:tab===t.id?`linear-gradient(135deg,${accF(weapon)},rgba(255,255,255,0.02))`:"transparent",border:`1px solid ${tab===t.id?accB(weapon):C.border}`,color:tab===t.id?acc(weapon):C.muted,padding:"6px 11px",borderRadius:8,cursor:"pointer",fontSize:11,whiteSpace:"nowrap",fontFamily:"'Cinzel',Georgia,serif",letterSpacing:"0.04em",transition:"all .18s",flexShrink:0}}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{padding:"0 18px 80px"}}>
        {tab === "scripture" && (
          <div>
            <div style={{fontSize:9,color:C.muted,letterSpacing:"0.16em",textTransform:"uppercase",fontFamily:"'Cinzel',Georgia,serif",marginBottom:12}}>Key Passages</div>
            {weapon.scriptures.map((s,i) => (
              <div key={i} style={{background:i===0?`linear-gradient(145deg,${accF(weapon)},rgba(255,255,255,0.01))`:C.bgCard,border:`1px solid ${i===0?accB(weapon):C.border}`,borderRadius:14,padding:"18px 20px",marginBottom:11}}>
                <div style={{fontSize:9,color:acc(weapon),letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:"'Cinzel',Georgia,serif",marginBottom:9}}>{s.ref}</div>
                <p style={{fontSize:18,color:C.cream,fontStyle:"italic",lineHeight:1.9,margin:0}}>"{s.text}"</p>
              </div>
            ))}
            <button onClick={()=>setShareCard({weapon,type:'scripture'})} style={{width:"100%",marginTop:4,background:C.goldF,border:`1px solid ${C.goldB}`,color:C.gold,padding:"11px",borderRadius:12,cursor:"pointer",fontSize:12,fontFamily:"'Cinzel',Georgia,serif",letterSpacing:"0.08em"}}>
              🖼 Create Share Card for Social Media
            </button>
          </div>
        )}

        {tab === "teaching" && (
          <div>
            <div style={{fontSize:9,color:C.muted,letterSpacing:"0.16em",textTransform:"uppercase",fontFamily:"'Cinzel',Georgia,serif",marginBottom:12}}>Warfare Teaching</div>
            <div style={{background:C.bgCard,border:`1px solid ${C.borderGold}`,borderRadius:14,padding:"20px 22px",fontSize:17,lineHeight:1.95,color:C.text,whiteSpace:"pre-line"}}>{weapon.teaching}</div>
            {weapon.fastingNote && (
              <div style={{marginTop:12,background:C.redF,border:`1px solid ${C.redB}`,borderRadius:12,padding:"14px 18px"}}>
                <div style={{fontSize:9,color:C.redL,letterSpacing:"0.16em",textTransform:"uppercase",fontFamily:"'Cinzel',Georgia,serif",marginBottom:7}}>🔥 Fasting Note</div>
                <p style={{fontSize:15,color:C.text,lineHeight:1.75,margin:0}}>{weapon.fastingNote}</p>
              </div>
            )}
            <button onClick={()=>setShareCard({weapon,type:'teaching'})} style={{width:"100%",marginTop:12,background:C.redF,border:`1px solid ${C.redB}`,color:C.redL,padding:"11px",borderRadius:12,cursor:"pointer",fontSize:12,fontFamily:"'Cinzel',Georgia,serif",letterSpacing:"0.08em"}}>
              🖼 Create Share Card
            </button>
          </div>
        )}

        {tab === "tactics" && (
          <div>
            <div style={{fontSize:9,color:C.muted,letterSpacing:"0.16em",textTransform:"uppercase",fontFamily:"'Cinzel',Georgia,serif",marginBottom:7}}>How the Enemy Attacks in This Area</div>
            <p style={{fontSize:13,color:C.muted,fontStyle:"italic",lineHeight:1.7,marginBottom:16}}>Know his methods. Forewarned is forearmed.</p>
            {weapon.tactics.map((t,i) => (
              <div key={i} style={{background:C.bgCard,border:`1px solid ${C.borderRed}`,borderLeft:`3px solid ${C.red}`,borderRadius:"0 12px 12px 0",padding:"13px 16px",marginBottom:9,display:"flex",gap:11,alignItems:"flex-start"}}>
                <span style={{color:C.red,fontFamily:"'Cinzel',Georgia,serif",fontSize:11,fontWeight:700,flexShrink:0,marginTop:2}}>{String(i+1).padStart(2,"0")}</span>
                <p style={{fontSize:16,color:C.text,lineHeight:1.7,margin:0}}>{t}</p>
              </div>
            ))}
            <div style={{marginTop:20,background:C.goldF,border:`1px solid ${C.goldB}`,borderRadius:14,padding:"16px 18px"}}>
              <div style={{fontSize:9,color:C.gold,letterSpacing:"0.16em",textTransform:"uppercase",fontFamily:"'Cinzel',Georgia,serif",marginBottom:8}}>⚡ Deploy This Weapon</div>
              <p style={{fontSize:16,color:C.cream,lineHeight:1.8,margin:0}}>{weapon.challenge}</p>
            </div>
            <button onClick={()=>setShareCard({weapon,type:'tactics'})} style={{width:"100%",marginTop:10,background:C.redF,border:`1px solid ${C.redB}`,color:C.redL,padding:"11px",borderRadius:12,cursor:"pointer",fontSize:12,fontFamily:"'Cinzel',Georgia,serif",letterSpacing:"0.08em"}}>
              🖼 Create Share Card
            </button>
          </div>
        )}

        {tab === "declare" && (
          <div>
            <div style={{background:`linear-gradient(145deg,rgba(158,40,40,0.12),rgba(158,40,40,0.04))`,border:`1px solid ${C.redB}`,borderRadius:16,padding:"22px",marginBottom:14,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-15,right:-15,fontSize:70,opacity:0.04,pointerEvents:"none"}}>⚔️</div>
              <div style={{fontSize:9,color:C.redL,letterSpacing:"0.18em",textTransform:"uppercase",fontFamily:"'Cinzel',Georgia,serif",marginBottom:12}}>⚔️ Spoken Declaration</div>
              <p style={{fontSize:18,color:C.cream,lineHeight:1.95,fontStyle:"italic",margin:0}}>"{weapon.declaration}"</p>
            </div>
            <div style={{background:`linear-gradient(145deg,rgba(176,138,78,0.08),rgba(176,138,78,0.02))`,border:`1px solid ${C.goldB}`,borderRadius:16,padding:"20px 22px",marginBottom:18}}>
              <div style={{fontSize:9,color:C.gold,letterSpacing:"0.18em",textTransform:"uppercase",fontFamily:"'Cinzel',Georgia,serif",marginBottom:10}}>🙏 Warfare Prayer</div>
              <p style={{fontSize:17,color:C.cream,lineHeight:1.95,margin:0,fontStyle:"italic"}}>{weapon.prayer}</p>
            </div>
            <button onClick={()=>markDeclared(weapon.id)} style={{width:"100%",background:declared[weapon.id]?`linear-gradient(135deg,rgba(124,146,132,0.2),rgba(124,146,132,0.08))`:`linear-gradient(135deg,rgba(158,40,40,0.3),rgba(158,40,40,0.12))`,border:`1px solid ${declared[weapon.id]?"rgba(124,146,132,0.4)":C.redB}`,color:declared[weapon.id]?"#7A9284":C.redL,padding:"13px",borderRadius:12,cursor:"pointer",fontSize:13,fontFamily:"'Cinzel',Georgia,serif",letterSpacing:"0.1em",transition:"all .3s"}}>
              {deployFlash[weapon.id]?"✦ Weapon Deployed":declared[weapon.id]?"✦ Deployed — Speak It Again":"⚔️ Declare This — Mark as Deployed"}
            </button>
            <button onClick={()=>setShareCard({weapon,type:'declaration'})} style={{width:"100%",marginTop:10,background:C.redF,border:`1px solid ${C.redB}`,color:C.redL,padding:"11px",borderRadius:12,cursor:"pointer",fontSize:12,fontFamily:"'Cinzel',Georgia,serif",letterSpacing:"0.08em"}}>
              🖼 Create Share Card
            </button>
            <p style={{fontSize:12,color:C.dim,fontStyle:"italic",lineHeight:1.6,marginTop:10,textAlign:"center"}}>Speak the declaration and prayer aloud. The spoken word has spiritual weight.</p>
          </div>
        )}

        {tab === "journal" && (
          <div>
            <div style={{fontSize:9,color:C.muted,letterSpacing:"0.16em",textTransform:"uppercase",fontFamily:"'Cinzel',Georgia,serif",marginBottom:7}}>Battle Journal</div>
            <p style={{fontSize:13,color:C.muted,fontStyle:"italic",lineHeight:1.7,marginBottom:14}}>What is the Holy Spirit showing you through this weapon? What areas of your life does it address? What is your response?</p>
            <textarea rows={10} value={get('journal')} onChange={e=>set('journal',e.target.value)} placeholder="Write your response, reflections, and warfare notes here..." style={{width:"100%",background:"rgba(255,255,255,0.03)",border:`1px solid ${C.borderGold}`,borderRadius:14,color:C.cream,fontSize:17,lineHeight:1.9,padding:"14px 16px",fontFamily:"'EB Garamond',Georgia,serif",outline:"none",resize:"vertical",boxSizing:"border-box",minHeight:200}}/>
            <div style={{marginTop:12,fontSize:11,color:C.dim,fontStyle:"italic",textAlign:"center"}}>Saved automatically to your account across all devices</div>
            <div style={{marginTop:14,background:C.goldF,border:`1px solid ${C.goldB}`,borderRadius:12,padding:"13px 16px"}}>
              <div style={{fontSize:9,color:C.gold,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:"'Cinzel',Georgia,serif",marginBottom:6}}>This Week's Challenge</div>
              <p style={{fontSize:15,color:C.text,lineHeight:1.75,margin:0}}>{weapon.challenge}</p>
            </div>
          </div>
        )}

        {tab === "tool" && weapon && (
          <div>
            <WeaponTool weapon={weapon} data={getToolData()} onChange={setToolData} C={C} />
          </div>
        )}
      </div>

      {tab !== "journal" && tab !== "tool" && (
        <button onClick={()=>{const i=TABS.findIndex(t=>t.id===tab);if(i<TABS.length-1){setTab(TABS[i+1].id);window.scrollTo(0,0);}}} style={{position:"fixed",bottom:82,right:18,background:`linear-gradient(135deg,${accF(weapon).replace("0.1","0.32")},${accF(weapon)})`,border:`1px solid ${accB(weapon)}`,color:acc(weapon),padding:"9px 18px",borderRadius:50,cursor:"pointer",fontSize:11,fontFamily:"'Cinzel',Georgia,serif",letterSpacing:"0.07em",boxShadow:"0 4px 20px rgba(0,0,0,0.4)",backdropFilter:"blur(10px)",zIndex:200,display:"flex",alignItems:"center",gap:7,transition:"all .2s"}}>
          {TABS[TABS.findIndex(t=>t.id===tab)+1]?.label} ›
        </button>
      )}
      <EmojDock activeId={selected}/>
    </div>
  );

  // ── SHARE CARD OVERLAY ─────────────────────────────────────────────────
  // (renders on top of everything when shareCard is set)
}
