import nodemailer from 'nodemailer'
import dotenv from 'dotenv'


class VerificationEmailSender {
  constructor(){
    dotenv.config()
    this.smtpTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NODE_MAILER_ID,
        pass: process.env.NODE_MAILER_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      }
    })
  }

  sendVerificationEmail(_emailAddress, payload, again=0){
    
    const EMAIL_ADDRESS = _emailAddress
  
    if (EMAIL_ADDRESS!="") {
      
      let subjectString = "[kndl.kr] 경남과학고등학교 재학생 서비스 이용을 위한 인증 코드입니다."
      if(again!=0){
        subjectString+=` (${again})`
      }
      const mailOptions = {
        from: process.env.NODE_MAILER_ID,
        to: EMAIL_ADDRESS,
        subject: subjectString,
        html: `<h1><a href="https://www.naver.com/">${payload}로 인증하기</a></h1>`
      }
      this.smtpTransport.sendMail(mailOptions, (error, responses) => {
        if(error){
          console.log(error)
        }
        this.smtpTransport.close()
      })
      return 400
    }  
    else{
      return 200
    }
  }
}
const verificationEmailSender = new VerificationEmailSender()
export default verificationEmailSender