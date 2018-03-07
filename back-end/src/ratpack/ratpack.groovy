import archangeldlt.webapi.GethProxyHandler
import archangeldlt.webapi.UploadHandler

import static ratpack.groovy.Groovy.ratpack

def findPrefix() {
  def p = System.getenv('HANDLER_PREFIX')
  return p ? "${p}/" : ""
} // findPrefix

def pathPrefix = findPrefix()
def monitor_path = "${pathPrefix}monitor"
def frontend_path = "${pathPrefix}front-end"
def geth_path = "${pathPrefix}geth"
def upload_path = "${frontend_path}/upload"

def tenMegs = 1048576 * 10
def uploadLimit = tenMegs

ratpack {
  serverConfig { conf ->
    conf.maxContentLength(uploadLimit)
  }

  handlers {
    get(monitor_path) {
      redirect("/${monitor_path}/index.html")
    }
    get(pathPrefix) {
      redirect("/${frontend_path}/index.html")
    }

    prefix(monitor_path) {
      files {
        dir "monitor" indexFiles "index.html"
      }
    }
    prefix(frontend_path) {
      files {
        dir "front-end" indexFiles "index.html"
      }
    }

    post(upload_path, new UploadHandler())
    post(geth_path, new GethProxyHandler())
  }
}