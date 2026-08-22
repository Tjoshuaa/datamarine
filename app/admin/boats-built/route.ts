async function deleteBoat(boat: BoatBuilt) {
  const confirmed = window.confirm(
    'Are you sure you want to permanently delete this boat?'
  )

  if (!confirmed) return

  setMessage('')
  setError('')

  try {
    const response = await fetch(
      '/api/admin/boats-built',
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: boat.id,
        }),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(
        result?.error ||
          'Failed to delete boat.'
      )
    }

    /**
     * Remove it immediately from the admin screen
     * instead of waiting for a page refresh.
     */
    setBoats(currentBoats =>
      currentBoats.filter(
        currentBoat =>
          currentBoat.id !== boat.id
      )
    )

    if (result.warning) {
      setMessage(
        `Boat deleted successfully. ${result.warning}`
      )
    } else {
      setMessage(
        'Boat and image deleted successfully.'
      )
    }

    /**
     * Confirm the database is now clean.
     */
    await loadBoats()
  } catch (err: any) {
    console.error(
      'Delete boat error:',
      err
    )

    setError(
      err?.message ||
        'Failed to delete boat.'
    )
  }
}
