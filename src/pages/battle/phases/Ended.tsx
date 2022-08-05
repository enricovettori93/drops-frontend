const Intro = () => {
  return (
    <>
      Thank you for playing!
      <br/>
      <button onClick={() => window.location.reload()}>
        Play again
      </button>
    </>
  )
}

export default Intro;
