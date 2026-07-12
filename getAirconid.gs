function getAirconId() {

  const appliances = getNatureRemoData("appliances");

  for(let i = 0; i < appliances.length; i++){

    if(appliances[i].type == "AC"){
      return appliances[i].id;
    }
  }

  throw new Error("エアコンが見つかりません");
}
