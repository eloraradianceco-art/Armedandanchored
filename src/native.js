// Helpers for the iPhone/Android app build (Capacitor).
// On the website every check below is false, so the web app behaves exactly as before.
import { Capacitor } from '@capacitor/core'
import { Share } from '@capacitor/share'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { Preferences } from '@capacitor/preferences'
import { StatusBar, Style } from '@capacitor/status-bar'

export const isNative = Capacitor.isNativePlatform()

// The app runs from files on the phone, so shared links use the full website address.
export const WEB_ORIGIN = 'https://armed.eloraradiance.com'

// Keeps the sign-in session in the phone's native storage, which iOS never clears on its own.
export const nativeAuthStorage = {
  getItem: async (key) => (await Preferences.get({ key })).value,
  setItem: async (key, value) => { await Preferences.set({ key, value }) },
  removeItem: async (key) => { await Preferences.remove({ key }) },
}

export async function nativeShareText({ title, text, url }) {
  try { await Share.share({ title, text, url, dialogTitle: title }) } catch (e) { /* user closed the share sheet */ }
}

export async function nativeShareImage(dataUrl, fileName, title) {
  const { uri } = await Filesystem.writeFile({
    path: fileName, data: dataUrl.split(',')[1], directory: Directory.Cache,
  })
  try { await Share.share({ title, files: [uri], dialogTitle: title }) } catch (e) { /* closed */ }
}

export async function nativeShareFile(content, fileName, title) {
  const { uri } = await Filesystem.writeFile({
    path: fileName, data: content, directory: Directory.Cache, encoding: Encoding.UTF8,
  })
  try { await Share.share({ title, files: [uri], dialogTitle: title }) } catch (e) { /* closed */ }
}

// Light text on the dark theme, dark text on the light theme.
export function syncStatusBar(lightMode) {
  if (!isNative) return
  StatusBar.setStyle({ style: lightMode ? Style.Light : Style.Dark }).catch(() => {})
}
