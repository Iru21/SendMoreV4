function logout() {
    location.href=`${location.origin}/auth/logout`
}

function login() {
    location.href=`${location.origin}/auth`
}

function onGuildSelect(guilds) {
    guilds = JSON.parse(guilds)
    const serverIcon = document.getElementById('serverIcon')
    const serverChooser = document.getElementById('guildSelect')
    const chosenServer = serverChooser.selectedIndex - 1
    serverIcon.src = guilds[chosenServer].icon != "" ? guilds[chosenServer].icon : `https://avatars.dicebear.com/api/identicon/${guilds[chosenServer].id}.svg`
    if(/\/$/.test(location.href)) {
        location.href = `${location.href}${guilds[chosenServer].id}`
    } else {
        location.href = `${location.href}/${guilds[chosenServer].id}`
    }
    
}

function onChannelSelect(channels) {
    channels = JSON.parse(channels)
    const channelChooser = document.getElementById('channelSelect')
    const chosenChannel = channelChooser.selectedIndex - 1
    if(/\/$/.test(location.href)) {
        location.href = `${location.href}${channels[chosenChannel].id}`
    } else {
        location.href = `${location.href}/${channels[chosenChannel].id}`
    }
}

async function handleInput() {
    const fileInput = document.getElementById('upload');
    const endpoint = `${location.href}${/\/$/.test(location.href) ? '' : '/'}send`
    if(fileInput.files.length > 30) return
    const [files, skips] = await fileListToBase64(fileInput.files, 199)
    const exts = getFileExtentions(fileInput.files, skips)
    const data = {
        files,
        exts
    }
    await fetch(endpoint, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    //location.reload(true)
}

async function fileListToBase64(list, maxSize) {
    const bases = []
    const skips = []

    for(let i = 0; i < list.length; i++) {
        const reader = new FileReader()
        const current = list.item(i)
        if(current.size > maxSize * 1000000) {
            skips.push(i)
        } else {
            reader.readAsDataURL(current)
            const [result, shouldSkip] = await handelReaderLoad(reader)
            if(!shouldSkip) bases.push(result)
            else skips.push(i)
        }
    }
    return [bases, skips]
}

// shit was too slow lol
function handelReaderLoad(reader) {
    let base = "", shouldSkip = false

    return new Promise (async (resolve, reject) => {
        await reader.addEventListener("load", () => {
            try {   
                const result = reader.result?.toString().replace(/^data:image\/(png|jpg|gif|jpeg);base64,/, "")
                if(result) {
                    base = result
                } else {
                    shouldSkip = true
                }
                resolve([base, shouldSkip])
            } catch(err) {
                reject(err)
            }
        })
    })
}

function getFileExtentions(list, skips) {
    const exts = []
    for(let i = 0; i < list.length; i++) {
        if(!skips.includes(i)) {
            const name = list.item(i)?.name
            const _ = name.split('.')
            exts.push(_[_.length - 1])
        }
    }
    return exts
}