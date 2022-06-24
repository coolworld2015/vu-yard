const func = async () => {
    try {
        let response = await fetch('https://gredunov.herokuapp.com/api/items/get');
        let user = await response.json();
        console.log(user);
    } catch (error) {
        console.log(error);
    }
  };