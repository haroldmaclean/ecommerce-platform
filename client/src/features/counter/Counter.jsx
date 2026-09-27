import { useSelector, useDispatch } from 'react-redux'
import { increment } from './counterSlice'

function Counter() {
  const count = useSelector((state) => state.counter.value)

  const dispatch = useDispatch()

  function handleIncrement() {
    dispatch(increment())
  }

  return (
    <main>
      <h1>Counter: {count}</h1>

      <button onClick={handleIncrement}>Increment</button>
    </main>
  )
}

export default Counter
