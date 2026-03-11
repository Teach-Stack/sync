export default defineEventHandler(async (event) => {
  const provider = getProvider(event)

  return { provider }
})
