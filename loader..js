class SchoolInfoLoader{
  constructor(apiKey, OEcode, AScode){
      this.apiKey = apiKey
      this.OEcode = OEcode
      this.AScode = AScode
  }
    
  loadTimeTable(grade, className, dateYMD) {
    const keyQueryString = `KEY=${this.apiKey}`
    const typeQueryString = "Type=json"

    const OEcodeQueryString = `ATPT_OFCDC_SC_CODE=${this.OEcode}`
    const AScodeQueryString = `SD_SCHUL_CODE=${this.AScode}`
    const gradeQueryString = `GRADE=${grade}`
    const classNameQueryString = `CLASS_NM=${className}`
    const dateQueryString = `ALL_TI_YMD=${dateYMD}`

    const schoolLevel = 'his'
    const url =
      `https://open.neis.go.kr/hub/${schoolLevel}Timetable?` +
      `${keyQueryString}` +
      `&${typeQueryString}` +
      `&${OEcodeQueryString}` +
      `&${AScodeQueryString}` +
      `&${dateQueryString}` +
      `&${gradeQueryString}` +
      `&${classNameQueryString}`

    let promiseTimeTableLoading
    return (promiseTimeTableLoading = fetch(url)
      .then(function (response) {
        return response.json()
      })
      .then(function (data) {
        if ("RESULT" in data) {
          console.log(data)
          return null
        } else {
          let res = data[`${schoolLevel}Timetable`][1]["row"]
          res = res.map((x) => x["ITRT_CNTNT"])
          return res
        }
      })
      .catch(function (err) {
        console.log(err)
        return null
      }))
  }
  loadMeal(dateString, mealCode) {
    //1: 아침 2: 점심 3: 저녁

    const keyQueryString = `KEY=${this.apiKey}`
    const typeQueryString = "Type=json"
    const pindexQueryString = "pIndex=1"
    const psizeQueryString = "pSize=3"


    const OEcodeQueryString = `ATPT_OFCDC_SC_CODE=${this.OEcode}`
    const AScodeQueryString = `SD_SCHUL_CODE=${this.AScode}`
    const dateQueryString = `MLSV_YMD=${dateString}`
    const mealCodeQueryString = `MMEAL_SC_CODE=${mealCode}`

    const url =
      `https://open.neis.go.kr/hub/mealServiceDietInfo?` +
      `${keyQueryString}` +
      `&${typeQueryString}` +
      `&${pindexQueryString}` +
      `&${psizeQueryString}` +
      `&${OEcodeQueryString}` +
      `&${AScodeQueryString}` +
      `&${dateQueryString}` +
      `&${mealCodeQueryString}`

    let promiseMealLoading
    return (promiseMealLoading = fetch(url)
      .then(function (response) {
        return response.json()
      })
      .then(function (data) {
        if ("RESULT" in data) {
          console.log("invalid meal api response")
          console.log(data)
          return null
        } else {
          let resText = data["mealServiceDietInfo"][1]["row"][0]["DDISH_NM"]
          let mealWithAllergy = resText.split("<br/>")
          let mealWithoutAllergy = mealWithAllergy.map((x) => x.split("  (")[0])
          return {
            "meal with allergy": mealWithAllergy,
            "meal without allergy": mealWithoutAllergy,
          }
        }
      })
      .catch(function (err) {
        console.log("failed to load meal")
        console.log(url)
        console.log(err)
        return null
      }))
  }
  loadSchedule(startDate, endDate) {
    //neis api
    //https://open.neis.go.kr/portal/data/service/selectServicePage.do?page=1&rows=10&sortColumn=&sortDirection=&infId=OPEN17220190722175038389180&infSeq=2#2
    const keyQueryString = `KEY=${this.apiKey}`
    const typeQueryString = "Type=json"

    const OECodeQueryString = `ATPT_OFCDC_SC_CODE=${this.OEcode}`
    const ASCodeQueryString = `SD_SCHUL_CODE=${this.AScode}`

    const startDateQueryString = `AA_FROM_YMD=${startDate}`
    const endDateQueryString = `AA_TO_YMD=${endDate}`

    const url =
      "https://open.neis.go.kr/hub/SchoolSchedule?" +
      "&" +
      keyQueryString +
      "&" +
      typeQueryString +
      "&" +
      OECodeQueryString +
      "&" +
      ASCodeQueryString +
      "&" +
      startDateQueryString +
      "&" +
      endDateQueryString

    let promiseScheduleLoading
    return (promiseScheduleLoading = fetch(url)
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        //PRIMITIVE: response로 받은 따끈따끈한 데이터
        const primitiveSchoolScheduleData = data

        const primitiveSchoolScheduleObjectsArray =
          this.extractPrimitiveObjectsArray(primitiveSchoolScheduleData)

        const schoolScheduleObjects = primitiveSchoolScheduleObjectsArray.map(
          this.manufactureSchoolScheduleObject.bind(this)
        )
        return schoolScheduleObjects
      })
      .catch((err) => {
        console.log("failed to load school schedule")
        console.log(url)
        console.log(err)
        return null
      }))
  }

  manufactureSchoolScheduleObject(_primitiveSchoolScheduleObject) {
    const primitiveSchoolScheduleObject = _primitiveSchoolScheduleObject
    const manufactured = {
      date: primitiveSchoolScheduleObject["AA_YMD"],
      name: primitiveSchoolScheduleObject["EVENT_NM"],
      content: primitiveSchoolScheduleObject["EVENT_CNTNT"],
      correspondingGradesArray:
        this.getCorrespondingGradesArray(
          primitiveSchoolScheduleObject
        ),
    }
    return manufactured
  }
  extractPrimitiveObjectsArray(primitiveData) {
    let primitiveObjectsArray = primitiveData["SchoolSchedule"][1]["row"]
    return primitiveObjectsArray
  }
  getCorrespondingGradesArray(_primitiveSchoolScheduleObject) {
    const primitiveSchoolScheduleObject = _primitiveSchoolScheduleObject
    let correspondingGradesArray = []
    const CORRESPONDING_GRADE_KEYS = {
      1: "ONE_GRADE_EVENT_YN",
      2: "TW_GRADE_EVENT_YN",
      3: "THREE_GRADE_EVENT_YN",
      4: "FR_GRADE_EVENT_YN",
      5: "FIV_GRADE_EVENT_YN",
      6: "SIX_GRADE_EVENT_YN",
    }
    for (let grade = 1; grade <= 6; grade++) {
      const thisGradeKey = CORRESPONDING_GRADE_KEYS[grade]
      if (primitiveSchoolScheduleObject[thisGradeKey] == "Y") {
        correspondingGradesArray.push(grade)
      }
    }
    return correspondingGradesArray
  }
}